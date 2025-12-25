// Utility function to download a DOM element as an image
export async function downloadSlideAsImage(elementId, fileName = 'slide.png') {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      console.error('Element not found')
      return
    }

    // Import html2canvas dynamically
    const html2canvas = (await import('html2canvas')).default
    
    // Capture the element
    const canvas = await html2canvas(element, {
      backgroundColor: '#0A0A0A',
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true
    })

    // Create download link
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = fileName
    link.click()
  } catch (error) {
    console.error('Error downloading slide:', error)
    alert('Failed to download slide. Please try again.')
  }
}
