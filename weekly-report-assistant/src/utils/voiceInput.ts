type VoiceCallback = (text: string, isFinal: boolean) => void

interface VoiceSession {
  stop: () => void
  isListening: boolean
}

export function startVoiceInput(onResult: VoiceCallback, onError: (err: string) => void): VoiceSession | null {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  if (!SpeechRecognition) {
    onError('当前浏览器不支持语音识别，请使用 Chrome 浏览器')
    return null
  }

  const recognition = new SpeechRecognition()
  recognition.lang = 'zh-CN'
  recognition.continuous = true
  recognition.interimResults = true
  recognition.maxAlternatives = 1

  let listening = true

  recognition.onresult = (event: any) => {
    let finalText = ''
    let interimText = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) {
        finalText += transcript
      } else {
        interimText += transcript
      }
    }
    if (finalText) onResult(finalText, true)
    else if (interimText) onResult(interimText, false)
  }

  recognition.onerror = (event: any) => {
    listening = false
    if (event.error === 'not-allowed') {
      onError('请授权麦克风权限')
    } else if (event.error !== 'aborted') {
      onError(`语音识别错误: ${event.error}`)
    }
  }

  recognition.onend = () => {
    listening = false
  }

  recognition.start()

  return {
    stop: () => {
      listening = false
      recognition.stop()
    },
    get isListening() { return listening },
  }
}
