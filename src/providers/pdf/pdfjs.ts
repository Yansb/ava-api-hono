import * as pdfjsLib from "pdfjs-dist"


export async function getFullPdf(pdfArrayBuffer: ArrayBuffer) {
  const loadingTask = pdfjsLib.getDocument(pdfArrayBuffer)

  const fullText =  await loadingTask.promise.then(async pdf => {
    let text = ""
    for(let pageNum = 1; pageNum <= 20; pageNum++){
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent();

      const pageText = textContent.items.map(item => item.str!).join(' ')
      text += pageText + "\n"
    }
    return text;
  })

  return fullText
}
