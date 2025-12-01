'use client';

import { Settings } from '@/types';
import { useEffect } from 'react';

interface ColorThemeProps {
  settings: Settings;
}

export function ColorTheme({ settings }: ColorThemeProps) {
  useEffect(() => {
    // Apply colors as CSS variables and directly to elements
    const root = document.documentElement;
    const body = document.body;
    
    // Store theme colors as CSS variables (hex format)
    if (settings.primary_color) {
      root.style.setProperty('--theme-primary', settings.primary_color);
    }
    if (settings.secondary_color) {
      root.style.setProperty('--theme-secondary', settings.secondary_color);
    }
    if (settings.accent_color) {
      root.style.setProperty('--theme-accent', settings.accent_color);
    }
    if (settings.background_color) {
      root.style.setProperty('--theme-background', settings.background_color);
      body.style.backgroundColor = settings.background_color;
    }
    if (settings.text_color) {
      root.style.setProperty('--theme-text', settings.text_color);
      body.style.color = settings.text_color;
    }
    
    // Inject dynamic styles for components
    let styleElement = document.getElementById('theme-colors');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'theme-colors';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = `
      /* Apply primary color to primary buttons */
      button.bg-primary,
      .bg-primary {
        ${settings.primary_color ? `background-color: ${settings.primary_color} !important;` : ''}
      }
      
      button.text-primary,
      .text-primary,
      a.text-primary {
        ${settings.primary_color ? `color: ${settings.primary_color} !important;` : ''}
      }
      
      /* Apply accent color */
      .bg-accent {
        ${settings.accent_color ? `background-color: ${settings.accent_color} !important;` : ''}
      }
      
      .text-accent {
        ${settings.accent_color ? `color: ${settings.accent_color} !important;` : ''}
      }
      
      /* Apply secondary color */
      .bg-secondary {
        ${settings.secondary_color ? `background-color: ${settings.secondary_color} !important;` : ''}
      }
      
      /* Border colors */
      .border-primary {
        ${settings.primary_color ? `border-color: ${settings.primary_color} !important;` : ''}
      }
    `;
  }, [settings]);

  return null;
}

