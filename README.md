# GlassTheme

Design elements library inspired from iOS 13.

# Usage

## Color System

It has some basic colors which both fit in light style and dark style.

Add a dash before the name of color to make it recognized as a system color.

For example: '-red' will be changed to 'var(--red)';

## iconKit

### Icon(image[, color][, position])

`image`: An image used to create icon, it can be a URL String or an element.

`color`: Optional. If you treat your image as a mask, use this parameter to fill the mask with color. **If your image is an element, you can't use this parameter.**

`position`: Optional. If your image is an sprite map you need provide the size and position of your 
