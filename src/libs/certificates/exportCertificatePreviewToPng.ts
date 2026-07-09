import { CERTIFICATE_CANVAS } from "./certificateLayout";

function getSafeFilenameValue(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-");
}

function readBlobAsDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

async function srcToDataUrl(src: string) {
  if (src.startsWith("data:")) return src;

  const response = await fetch(new URL(src, window.location.href));
  const blob = await response.blob();
  return readBlobAsDataUrl(blob);
}

function copyComputedStyles(source: Element, clone: Element) {
  const computedStyle = window.getComputedStyle(source);
  const styledClone = clone as HTMLElement;

  for (const property of computedStyle) {
    styledClone.style.setProperty(
      property,
      computedStyle.getPropertyValue(property),
      computedStyle.getPropertyPriority(property),
    );
  }

  Array.from(source.children).forEach((sourceChild, index) => {
    const cloneChild = clone.children.item(index);
    if (cloneChild) {
      copyComputedStyles(sourceChild, cloneChild);
    }
  });
}

async function inlineImages(source: Element, clone: Element) {
  const sourceImages = Array.from(source.querySelectorAll("img"));
  const cloneImages = Array.from(clone.querySelectorAll("img"));

  await Promise.all(
    sourceImages.map(async (sourceImage, index) => {
      const cloneImage = cloneImages[index];
      if (!cloneImage) return;

      cloneImage.setAttribute("src", await srcToDataUrl(sourceImage.currentSrc || sourceImage.src));
    }),
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function exportCertificatePreviewToPng(
  element: HTMLElement,
  serialNumber: string,
) {
  const bounds = element.getBoundingClientRect();
  const clone = element.cloneNode(true) as HTMLElement;

  copyComputedStyles(element, clone);
  await inlineImages(element, clone);

  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  clone.style.width = `${bounds.width}px`;
  clone.style.height = `${bounds.height}px`;
  clone.style.transform = "none";

  const serialized = new XMLSerializer().serializeToString(clone);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${bounds.width}" height="${bounds.height}" viewBox="0 0 ${bounds.width} ${bounds.height}">
      <foreignObject width="100%" height="100%">
        ${serialized}
      </foreignObject>
    </svg>
  `;
  const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  const image = new Image();
  const scale = CERTIFICATE_CANVAS.width / bounds.width;
  const canvas = document.createElement("canvas");

  canvas.width = CERTIFICATE_CANVAS.width;
  canvas.height = Math.round(bounds.height * scale);

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("No se pudo renderizar el certificado"));
    image.src = svgUrl;
  });

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo crear el lienzo de exportacion");
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  downloadDataUrl(
    canvas.toDataURL("image/png"),
    `certificado-${getSafeFilenameValue(serialNumber)}.png`,
  );
}
