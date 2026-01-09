'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition, useRef, useState, useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { addItem } from '@/app/actions';
import { PlusCircle, Loader2, Camera, Video, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

const formSchema = z.object({
  type: z.enum(['Lost', 'Found'], {
    required_error: 'You need to select an item type.',
  }),
  name: z.string().min(3, 'Item name must be at least 3 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  location: z.string().min(3, 'Location must be at least 3 characters.'),
  contact: z.string().min(5, 'Contact information is required.'),
  photo: z.string().optional(),
});

export default function ItemForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
      contact: '',
      type: 'Lost',
      photo: '',
    },
  });

  const itemType = form.watch('type');

  useEffect(() => {
    if (itemType === 'Found') {
      const getCameraPermission = async () => {
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
          setStream(mediaStream);
          setHasCameraPermission(true);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } catch (error) {
          console.error('Error accessing camera:', error);
          setHasCameraPermission(false);
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings.',
          });
        }
      };
      getCameraPermission();
    } else {
      // Stop camera stream when switching to 'Lost'
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        if(videoRef.current) videoRef.current.srcObject = null;
      }
      setCapturedImage(null);
      form.setValue('photo', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemType]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/png');
        setCapturedImage(dataUri);
        form.setValue('photo', dataUri);
      }
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });

    startTransition(async () => {
      const result = await addItem(formData);
      if (result?.error) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: typeof result.error === 'string' ? result.error : 'Please check the form for errors.',
        });
      } else {
        toast({
          title: 'Success!',
          description: 'Your item has been posted to the board.',
        });
        form.reset();
        setCapturedImage(null);
      }
    });
  }

  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
      <AccordionItem value="item-1" className="border rounded-lg shadow-sm bg-card">
        <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-3">
                <PlusCircle className="text-primary h-6 w-6"/>
                <span>Report a Lost or Found Item</span>
            </div>
        </AccordionTrigger>
        <AccordionContent className="px-6">
          <Form {...form}>
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>This item is...</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex items-center space-x-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Lost" />
                          </FormControl>
                          <FormLabel className="font-normal">Lost</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="Found" />
                          </FormControl>
                          <FormLabel className="font-normal">Found</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {itemType === 'Found' && (
                <div className="space-y-4 rounded-lg border p-4">
                   <h3 className="text-lg font-medium flex items-center gap-2"><Video /> Camera</h3>
                  {hasCameraPermission === undefined && (
                    <div className="flex items-center justify-center h-48 bg-muted rounded-md">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {hasCameraPermission === false && (
                     <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Camera Access Required</AlertTitle>
                      <AlertDescription>
                        Please allow camera access in your browser to add a photo.
                      </AlertDescription>
                    </Alert>
                  )}
                   {hasCameraPermission && (
                     <div className='space-y-4'>
                       <div className="relative">
                         <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted playsInline />
                       </div>
                        <Button type="button" onClick={handleCapture} className="w-full">
                          <Camera className="mr-2 h-4 w-4" />
                          Capture Photo
                        </Button>
                     </div>
                   )}
                   {capturedImage && (
                     <div className='space-y-2'>
                        <h4 className='font-medium'>Captured Image:</h4>
                        <div className="relative border rounded-md p-2">
                           <Image src={capturedImage} alt="Captured item" width={400} height={300} className="rounded-md w-full" />
                           <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={() => {
                                 setCapturedImage(null);
                                 form.setValue('photo', '');
                              }}
                           >
                              Remove
                           </Button>
                        </div>
                     </div>
                   )}
                   <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Black iPhone 13" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the item. Include any identifying features."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Library, 2nd floor" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name, email, or phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Item'
                )}
              </Button>
            </form>
          </Form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
