export async function downloadSlides(slideIds) {
  try {
    const { default: domToImage } = await import('dom-to-image-more')

    for (const slideId of slideIds) {
      // Determine if this is a carousel slide
      const isCarousel = slideId.includes('percentile-') || 
                        slideId.includes('career-skills-') || 
                        slideId.includes('skill-insights-') ||
                        slideId.includes('showcase-')

      let element

      if (isCarousel) {
        // For carousel slides, navigate to them first
        element = await navigateAndGetCarouselSlide(slideId)
        if (!element) {
          console.warn(`Could not navigate to carousel slide: ${slideId}`)
          continue
        }
        // Wait for animation to complete
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        // For regular slides (hero)
        element = document.getElementById(slideId)
        if (!element) {
          console.warn(`Slide not found: ${slideId}`)
          continue
        }
        // Wait for any animations to complete
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Prepare for screenshot
      const backups = prepareSlideForCapture(element)

      try {
        // Capture the slide
        const dataUrl = await domToImage.toPng(element, {
          pixelRatio: 2,
          backgroundColor: '#0A0A0A',
          cacheBust: true
        })

        // Download
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `${slideId}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (error) {
        console.error(`Error capturing ${slideId}:`, error)
      }

      // Restore slide
      restoreSlideAfterCapture(element, backups)

      // Delay before next download
      await new Promise(resolve => setTimeout(resolve, 600))
    }
  } catch (error) {
    console.error('Download error:', error)
    alert('Failed to download slides')
  }
}

function prepareSlideForCapture(element) {
  const backups = []

  // Hide navigation arrows
  const navButtons = element.querySelectorAll('button[class*="absolute"][class*="top-1/2"]')
  navButtons.forEach(btn => {
    backups.push({
      el: btn,
      type: 'display',
      oldValue: btn.style.display
    })
    btn.style.display = 'none'
  })

  // Hide indicator dots
  const dots = element.querySelectorAll('[class*="absolute"][class*="bottom"]')
  dots.forEach(dot => {
    const classList = dot.className
    if (classList.includes('left-1/2') && classList.includes('flex')) {
      backups.push({
        el: dot,
        type: 'display',
        oldValue: dot.style.display
      })
      dot.style.display = 'none'
    }
  })

  // Remove borders and outlines from all elements
  const allElements = element.querySelectorAll('*')
  allElements.forEach(el => {
    backups.push({
      el,
      type: 'styles',
      border: el.style.border,
      outline: el.style.outline,
      boxShadow: el.style.boxShadow
    })
    el.style.border = 'none'
    el.style.outline = 'none'
    el.style.boxShadow = 'none'
  })

  // Add logo to bottom right
  const logoContainer = document.createElement('div')
  logoContainer.id = 'capture-logo-' + Date.now()
  logoContainer.style.cssText = `
    position: absolute;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
    width: 140px;
    height: 140px;
    padding: 0;
    margin: 0;
  `
  
  const logoImg = document.createElement('img')
  logoImg.src = '/logo.svg'
  logoImg.style.cssText = `
    width: 100%;
    height: 100%;
    object-fit: contain;
    border: none;
    outline: none;
    box-shadow: none;
    padding: 0;
    margin: 0;
    display: block;
  `
  
  logoContainer.appendChild(logoImg)
  element.style.position = 'relative'
  element.appendChild(logoContainer)
  
  backups.push({
    el: logoContainer,
    type: 'logo'
  })

  return backups
}

function restoreSlideAfterCapture(element, backups) {
  backups.forEach(backup => {
    if (backup.type === 'display') {
      backup.el.style.display = backup.oldValue
    } else if (backup.type === 'styles') {
      backup.el.style.border = backup.border
      backup.el.style.outline = backup.outline
      backup.el.style.boxShadow = backup.boxShadow
    } else if (backup.type === 'logo') {
      backup.el.remove()
    }
  })
}

async function navigateAndGetCarouselSlide(slideId) {
  // Parse the slide ID to get section and index
  let sectionId, slideIndex

  if (slideId === 'slide-percentile-0') {
    sectionId = 'slide-percentile'
    slideIndex = 0
  } else if (slideId === 'slide-percentile-1') {
    sectionId = 'slide-percentile'
    slideIndex = 1
  } else if (slideId === 'slide-career-skills-0') {
    sectionId = 'slide-career-skills'
    slideIndex = 0
  } else if (slideId === 'slide-career-skills-1') {
    sectionId = 'slide-career-skills'
    slideIndex = 1
  } else if (slideId === 'slide-skill-insights-0') {
    sectionId = 'slide-skill-insights'
    slideIndex = 0
  } else if (slideId === 'slide-skill-insights-1') {
    sectionId = 'slide-skill-insights'
    slideIndex = 1
  } else if (slideId === 'slide-skill-insights-2') {
    sectionId = 'slide-skill-insights'
    slideIndex = 2
  } else if (slideId && slideId.startsWith('slide-showcase-')) {
    sectionId = 'slide-showcase'
    slideIndex = parseInt(slideId.split('-').pop())
  } else {
    return null
  }

  // Get the carousel container
  const container = document.getElementById(sectionId)
  if (!container) {
    console.warn(`Container not found: ${sectionId}`)
    return null
  }

  // Navigate to the desired slide
  navigateToSlide(container, slideIndex)

  return container
}

function navigateToSlide(container, targetIndex) {
  // Find the navigation buttons
  const buttons = container.querySelectorAll('button[class*="absolute"][class*="top-1/2"]')
  if (buttons.length < 2) return

  const prevBtn = buttons[0]
  const nextBtn = buttons[1]

  // Find current slide from indicators
  const indicators = container.querySelectorAll('[class*="absolute"][class*="bottom"] button')
  let currentIndex = 0

  indicators.forEach((indicator, idx) => {
    const classList = indicator.className
    if (classList.includes('w-8') || classList.includes('bg-primary')) {
      currentIndex = idx
    }
  })

  // Calculate clicks needed
  const diff = targetIndex - currentIndex
  const isNext = diff > 0
  const clicksNeeded = Math.abs(diff)

  // Click to navigate
  for (let i = 0; i < clicksNeeded; i++) {
    if (isNext) {
      nextBtn.click()
    } else {
      prevBtn.click()
    }
    // Small delay between clicks
    new Promise(resolve => setTimeout(resolve, 100))
  }
}
