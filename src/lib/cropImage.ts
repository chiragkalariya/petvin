export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    if (!url.startsWith("data:") && !url.startsWith("blob:")) {
      image.setAttribute("crossOrigin", "anonymous");
    }
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  fileName = "cropped-image.jpg"
): Promise<{ file: File; url: string } | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");

  if (!croppedCtx) {
    return null;
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image onto the new canvas
  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob(
      (blob) => {
        if (!blob) {
          resolve(null);
          return;
        }
        const safeName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
        const file = new File([blob], safeName, {
          type: "image/jpeg",
        });
        const url = URL.createObjectURL(blob);
        resolve({ file, url });
      },
      "image/jpeg",
      0.92
    );
  });
}

export async function autoCropToRatio(
  imageSrc: string,
  targetRatio = 4 / 3,
  fileName = "cropped-image.jpg"
): Promise<{ file: File; url: string } | null> {
  const image = await createImage(imageSrc);
  const imgRatio = image.width / image.height;

  let cropWidth = image.width;
  let cropHeight = image.height;
  let cropX = 0;
  let cropY = 0;

  if (imgRatio > targetRatio) {
    // Image is wider than target ratio
    cropHeight = image.height;
    cropWidth = Math.round(image.height * targetRatio);
    cropX = Math.round((image.width - cropWidth) / 2);
    cropY = 0;
  } else {
    // Image is taller than target ratio
    cropWidth = image.width;
    cropHeight = Math.round(image.width / targetRatio);
    cropX = 0;
    cropY = Math.round((image.height - cropHeight) / 2);
  }

  return getCroppedImg(
    imageSrc,
    { x: cropX, y: cropY, width: cropWidth, height: cropHeight },
    0,
    { horizontal: false, vertical: false },
    fileName
  );
}

