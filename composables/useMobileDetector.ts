export function useMobileDetector() {
  const isPortraitMobile = ref(false)

  function onChangeScreenSize(query: MediaQueryList) {
    if (query.matches) {
      isPortraitMobile.value = true
    } else {
      isPortraitMobile.value = false
    }
  }

  onMounted(() => {
    const mediaQuery = window.matchMedia('(max-width: 600px)');
    mediaQuery.addEventListener('change', (ev) => onChangeScreenSize(ev.target as MediaQueryList))
    onChangeScreenSize(mediaQuery)
  })

  return { isPortraitMobile }
}