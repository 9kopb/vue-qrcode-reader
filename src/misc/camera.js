import { imageDataFromVideo } from './image-data.js'

class Camera {

  constructor (videoEl, stream) {
    this.videoEl = videoEl
    this.stream = stream
  }

  getWidth () {
    return this.videoEl.videoWidth
  }

  getHeight () {
    return this.videoEl.videoHeight
  }

  stop () {
    this.stream.getTracks().forEach(
      track => track.stop()
    )
  }

  captureFrame () {
    return imageDataFromVideo(this.videoEl)
  }

  streamToCanvas (canvasEl) {
    let keepStreaming = true

    const ctx = canvasEl.getContext('2d')

    const paintFrame = () => {
      if (keepStreaming && !this.videoEl.ended) {
        window.requestAnimationFrame(paintFrame)

        canvasEl.width = this.getWidth()
        canvasEl.height = this.getHeight()

        ctx.drawImage(this.videoEl, 0, 0, canvasEl.width, canvasEl.height)
      }
    }

    paintFrame()

    const stopStreaming = () => {
      keepStreaming = false
    }

    return stopStreaming
  }

}

export default async function (constraints) {
  if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    throw new Error('WebRTC API not supported in this browser')
  }

  const videoEl = document.createElement('video')
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
