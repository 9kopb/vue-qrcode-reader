import { imageDataFromVideo } from './image-data.js'

class Camera {

  constructor (videoEl, stream) {
    this.videoEl = videoEl
    this.stream = stream
  }

  get resolutionWidth () {
    return this.videoEl.videoWidth
  }

  get resolutionHeight () {
    return this.videoEl.videoHeight
  }

  get displayWidth () {
    return this.videoEl.offsetWidth
  }

  get displayHeight () {
    return this.videoEl.offsetHeight
  }

  stop () {
    this.stream.getTracks().forEach(
      track => track.stop()
    )
  }

  captureFrame () {
    return imageDataFromVideo(this.videoEl)
  }

}

export default async function (constraints, videoEl) {
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    throw new Error('WebRTC API not supported in this browser')
  }

  const stream = await navigator.mediaDevices.getUserMedia(constraints)

  const streamLoadedPromise = new Promise((resolve, reject) => {
    videoEl.addEventListener('loadeddata', resolve, { once: true })
    videoEl.addEventListener('error', reject, { once: true })
  })

  if (videoEl.srcObject !== undefined) {
    videoEl.srcObject = stream
  } else if (videoEl.mozSrcObject !== undefined) {
    videoEl.mozSrcObject = stream
  } else if (window.URL.createObjectURL) {
    videoEl.src = window.URL.createObjectURL(stream)
  } else if (window.webkitURL) {
    videoEl.src = window.webkitURL.createObjectURL(stream)
  } else {
    videoEl.src = stream
  }

  videoEl.playsInline = true
  videoEl.play() // firefox does not emit `loadeddata` if video not playing

  await streamLoadedPromise

  return new Camera(videoEl, stream)
}
