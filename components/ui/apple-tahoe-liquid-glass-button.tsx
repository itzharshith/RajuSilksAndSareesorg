import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// The ultra-optimized WebP normal map from the reference
const WEBP_DISPLACEMENT_MAP = "data:image/webp;base64,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";

const glassButtonVariants = cva(
  "relative isolate inline-flex items-center justify-center gap-2 rounded-full cursor-pointer transition-transform duration-300 ease-out tracking-tight disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
  {
    variants: {
      size: {
        default: "px-6 py-3.5 text-base font-medium",
        sm: "px-4 py-2 text-sm font-medium",
        lg: "px-8 py-4 text-lg font-medium",
        icon: "h-10 w-10 p-0 gap-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

export interface GlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof glassButtonVariants> {
  contentClassName?: string;
  glassColor?: string; // e.g. "oklch(from var(--foreground) l c h / 10%)"
}

const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, children, size, contentClassName, glassColor, ...props }, ref) => {
    // Generate a unique ID so multiple buttons don't conflict with each other's SVG filters
    const filterId = React.useId().replace(/:/g, "");

    return (
      <>
        {/* INVISIBLE SVG FILTER DEFINITION */}
        {/* 
            primitiveUnits="objectBoundingBox" allows the 1x1 displacement map to seamlessly 
            stretch and scale to fit ANY button size automatically without JS calculation.
        */}
        <svg className="absolute w-0 h-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <filter id={`liquid-glass-${filterId}`} primitiveUnits="objectBoundingBox">
            <feImage 
              result="map" 
              width="100%" 
              height="100%" 
              x="0" 
              y="0" 
              href={WEBP_DISPLACEMENT_MAP} 
              preserveAspectRatio="none" 
            />
            {/* The pre-blur helps smooth out the underlying image before refraction */}
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.01" result="blur" />
            <feDisplacementMap 
              id="disp" 
              in="blur" 
              in2="map" 
              scale="0.5" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </svg>

        <style>{`
          .btn-liquid {
            appearance: none;
            border: none;
            background: transparent;
            color: oklch(from var(--foreground) l c h / 95%);
            --glass-reflex-light: 1;
            --glass-reflex-dark: 1;
          }

          /* 
             THE LENS LAYER (-z-10)
             This must remain completely empty of content.
             Because it is empty, Chrome's backdrop-filter engine will only grab 
             the background behind the button, guaranteeing zero text-ghosting!
          */
          .btn-liquid-lens {
            /* If no glassColor is provided, default to a subtle, frosted glass */
            background-color: ${glassColor || "rgba(255, 255, 255, 0.15)"};
            
            /* Chrome/Edge mathematically refracts via the SVG. Safari falls back to blur. */
            backdrop-filter: blur(8px) url(#liquid-glass-${filterId}) saturate(150%);
            -webkit-backdrop-filter: blur(8px) saturate(150%);
            
            /* The intricate, highly realistic Box Shadow stack from the CodePen */
            box-shadow: 
              inset 0 0 0 1px color-mix(in srgb, white calc(var(--glass-reflex-light) * 10%), transparent),
              inset 1.8px 3px 0px -2px color-mix(in srgb, white calc(var(--glass-reflex-light) * 90%), transparent), 
              inset -2px -2px 0px -2px color-mix(in srgb, white calc(var(--glass-reflex-light) * 80%), transparent), 
              inset -3px -8px 1px -6px color-mix(in srgb, white calc(var(--glass-reflex-light) * 60%), transparent), 
              inset -0.3px -1px 4px 0px color-mix(in srgb, black calc(var(--glass-reflex-dark) * 12%), transparent), 
              inset -1.5px 2.5px 0px -2px color-mix(in srgb, black calc(var(--glass-reflex-dark) * 20%), transparent), 
              inset 0px 3px 4px -2px color-mix(in srgb, black calc(var(--glass-reflex-dark) * 20%), transparent), 
              inset 2px -6.5px 1px -4px color-mix(in srgb, black calc(var(--glass-reflex-dark) * 10%), transparent), 
              0px 1px 5px 0px color-mix(in srgb, black calc(var(--glass-reflex-dark) * 10%), transparent), 
              0px 6px 16px 0px color-mix(in srgb, black calc(var(--glass-reflex-dark) * 8%), transparent);
              
            transition: background-color 400ms cubic-bezier(1, 0.0, 0.4, 1), box-shadow 400ms cubic-bezier(1, 0.0, 0.4, 1);
          }

          /* Text Layer: Floats cleanly above the glass */
          .btn-liquid-text {
            transition: color 400ms cubic-bezier(1, 0.0, 0.4, 1);
          }
          
          /* Hover & Active Interactions */
          @media (hover: hover) {
            .btn-liquid:not(:disabled):hover {
              transform: scale(1.03);
            }
          }
          .btn-liquid:not(:disabled):active {
            transform: scale(0.96);
          }
        `}</style>
        
        <button
          className={cn(glassButtonVariants({ size }), "btn-liquid", className)}
          ref={ref}
          {...props}
        >
          {/* ISOLATED BACKGROUND LENS */}
          <span className="btn-liquid-lens absolute inset-0 -z-10 rounded-[inherit] pointer-events-none" />

          {/* TEXT CONTENT (Composited safely ABOVE the backdrop filter) */}
          <span className={cn("btn-liquid-text relative z-10 w-full flex items-center justify-center gap-[inherit] select-none", contentClassName)}>
            {children}
          </span>
        </button>
      </>
    );
  }
);
GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };
