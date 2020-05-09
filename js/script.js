const video = document.getElementById('video')
let predictedAges = []

Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
  faceapi.nets.faceExpressionNet.loadFromUri('./models'),
  faceapi.nets.ageGenderNet.loadFromUri('./models')
]).then(startVideo)

function startVideo() {
  navigator.getUserMedia(
    { video: {} },
    stream => video.srcObject = stream,
    err => console.error(err)
  )
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.body.append(canvas)
  const displaySize = { width: video.width, height: video.height }
  faceapi.matchDimensions(canvas, displaySize)

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(
      video,
      new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()

    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)

    if (resizedDetections.length === 0) return

    const age = resizedDetections[0].age
    const interpolatedAge = interpolateAgePredictions(age)
    const bottomRight = {
      x: resizedDetections[0].detection.box.bottomRight.x,
      y: resizedDetections[0].detection.box.bottomRight.y
    }

    // `onButtonSubmit = () => {
    //   this.setState({imageUrl: this.state.input});
    //     fetch('http://localhost:3000/imageurl', {
    //       method: 'post',
    //       headers: {
    //         'Content-Type': 'application/json',
    //         'Authorization': window.sessionStorage.getItem('token')
    //       },
    //       body: JSON.stringify({
    //         input: this.state.input
    //       })
    //     })
    //     .then(response => response.json())
    //     .then(response => {
    //       if (response) {
    //         fetch('http://localhost:3000/image', {
    //           method: 'put',
    //           headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': window.sessionStorage.getItem('token')
    //           },
    //           body: JSON.stringify({
    //             id: this.state.user.id
    //           })
    //         })
    //           .then(response => response.json())
    //           .then(count => {
    //             this.setState(Object.assign(this.state.user, { entries: count}))
    //           })
    //           .catch(console.log)

    //       }
    //       console.log(response)
    //       this.displayFaceBoxes(this.calculateFaceLocations(response))
    //     })
    //     .catch(err => console.log(err));
    // }`

    document.getElementById('export').onclick = function () {
      var = window.open('', '_blank');
      var img = ''
      win.document.write('<img style="box-shadow: 0 0 1em 0 dimgrey" src="' + img + '"/>')
    }

    console.log(faceapi)
    new faceapi.draw.DrawTextField(
      [`${faceapi.utils.round(interpolatedAge, 0)} years`],
      bottomRight
    ).draw(canvas)

  }, 100)
});

function interpolateAgePredictions(age) {
  predictedAges = [age].concat(predictedAges).slice(0, 30)
  const avgPredictedAge =
    predictedAges.reduce((total, a) => total + a) / predictedAges.length

  return avgPredictedAge
}