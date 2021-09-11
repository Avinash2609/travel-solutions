let video;
let poseNet;
let pose;
let skeleton;
let flag = -1;
let brain;
let poseLabel = "Hold!!";
let upsound;
let downsound;
let intro;
let start_time;

function preload() {
  soundFormats('mp3', 'ogg');
  upsound = loadSound('./sounds/moveup');
  downsound = loadSound('./sounds/movedown');
  intro = loadSound('./sounds/intro');
}


function setup() {
  start_time = minute();
  createCanvas(600, 450);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on('pose', gotPoses);

  let options = {
    inputs: 34,
    outputs: 3,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
  const modelInfo = {
    model: './model2/model.json',
    metadata: './model2/model_meta.json',
    weights: './model2/model.weights.bin',
  };
  brain.load(modelInfo, brainLoaded);
}

function brainLoaded() {
  console.log('pose classification ready!');
  setTimeout(fake, 10000);
}

function fake() {
  console.log("hi");
  classifyPose();
}

function classifyPose() {
  console.log(start_time);
  console.log(minute());
  if (pose) {
    // if (start_time + 1 != minute()) {

      let inputs = [];
      for (let i = 0; i < pose.keypoints.length; i++) {
        let x = pose.keypoints[i].position.x;
        let y = pose.keypoints[i].position.y;
        inputs.push(x);
        inputs.push(y);
      }
      brain.classify(inputs, gotResult);
    // }
    // else {
    //   console.log("Finished")
    //   intro.stop();
    //   upsound.stop();
    //   downsound.stop();
    //   flag = 3;
    //   delay2();
    //   //play thanks
    // }
  } else {
    setTimeout(classifyPose, 3000);
  }
}

function gotResult(error, results) {

  if (results[0].confidence > 0.80) {
    poseLabel = results[0].label.toUpperCase();
  }
  //console.log(results[0].confidence);
  classifyPose();
}


function gotPoses(poses) {
  if (poses.length > 0) {
    pose = poses[0].pose;
    skeleton = poses[0].skeleton;
  }
}


function modelLoaded() {
  console.log('poseNet ready');
}

function draw() {
  push();
  translate(video.width, 0);
  scale(-1, 1);
  image(video, 0, 0, video.width, video.height);

  if (pose) {
    for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(2);
      stroke(0);

      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
    for (let i = 0; i < pose.keypoints.length; i++) {
      let x = pose.keypoints[i].position.x;
      let y = pose.keypoints[i].position.y;
      fill(0);
      stroke(255);
      ellipse(x, y, 16, 16);
    }
  }
  pop();

  fill(0, 255, 0);
  noStroke();
  textSize(50);
  // textAlign(0,0);
  if (poseLabel == "Q") {
    text("Move Up", 20, 50);
    if (flag == 0) {
      flag = 1;
      downsound.stop();
      upsound.stop();
      upsound.play();
      setTimeout(delay, 1800);
    }
  } else if (poseLabel == "T") {
    text("Move Down", 20, 50);
    if (flag == 0) {
      flag = 1;
      downsound.stop();
      upsound.stop();
      downsound.play();
      setTimeout(delay, 2000);
    }
  } else {
    text(poseLabel, 20, 50);
    if (flag == -1) {
      flag = 0;
      intro.play();
      setTimeout(delay, 11000);
    }
  }
}

function delay() {
  flag = 0;
}

// function delay2() {
//   intro.stop();
//       upsound.stop();
//       downsound.stop();
//       flag = 3;
//   setTimeout(delay2, 1000);
// }