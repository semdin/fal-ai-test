"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { fal } from "@fal-ai/client";
import { Loader2 } from "lucide-react";

import { useToast } from "@/components/ui/use-toast";

export interface ImageResult {
  url: string;
}

const inpaintFormSchema = z.object({
  prompt: z
    .string()
    .min(5, { message: "Prompt is required and should be descriptive." }),
  inpaint_image_url: z
    .string()
    .url({ message: "Invalid URL for inpaint image." }),
  mask_image_url: z.string().url({ message: "Invalid URL for mask image." }),
});

interface InpaintFormProps {
  onResult: (results: ImageResult[]) => void;
}

export default function InpaintForm({ onResult }: InpaintFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof inpaintFormSchema>>({
    resolver: zodResolver(inpaintFormSchema),
    defaultValues: {
      prompt: "a woman wearing boots, walking in the street on the left angle",
      inpaint_image_url: "https://i.ibb.co/JHSyMqt/botv12.png",
      mask_image_url: "https://i.ibb.co/7yGCzvF/botv12-mask.png",
    },
  });

  const generateRandomSeed = () => Math.floor(Math.random() * 1000000);

  const onSubmit = async (values: z.infer<typeof inpaintFormSchema>) => {
    setIsLoading(true);
    try {
      fal.config({
        proxyUrl: "/api/fal/proxy",
      });
      const result = (await fal.subscribe("fal-ai/fooocus/inpaint", {
        input: {
          ...values,
          negative_prompt:
            "(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3)",
          styles: ["Fooocus Enhance", "Fooocus V2", "Fooocus Sharp"],
          performance: "Quality",
          guidance_scale: 4,
          sharpness: 2,
          aspect_ratio: "1024x1024",
          num_images: 1,
          loras: [
            {
              path: "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_offset_example-lora_1.0.safetensors",
              scale: 0.1,
            },
          ],
          refiner_model: "None",
          refiner_switch: 0.8,
          output_format: "jpeg",
          seed: generateRandomSeed(),
          inpaint_mode: "Inpaint or Outpaint (default)",
          outpaint_selections: [],
          inpaint_engine: "v2.6",
          inpaint_strength: 1,
          inpaint_respective_field: 0.618,
          inpaint_erode_or_dilate: 32.0,
          enable_safety_checker: true,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log(
              "Progress:",
              update.logs.map((log) => log.message)
            );
          }
        },
      })) as { data: { images: ImageResult[] } };

      onResult(result.data.images || []);
      toast({
        title: "Success",
        description: "Image generated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was an error generating the image. Please try again later.",
      });
      console.error("Error generating image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Describe the image you want to generate..."
                      className="min-h-[100px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="inpaint_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Inpaint Image URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://example.com/image.jpg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mask_image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mask Image URL</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://example.com/mask.jpg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Image"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
