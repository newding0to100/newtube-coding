const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { Video } = require("../models/Video");

const storage = multer.diskStorage({
  destination: (req, file, done) => {
    done(null, "uploads/");
  },
  filename: (req, file, done) => {
    done(null, `${Date.now()}_${file.originalname}`);
  },
  //fileFilter 작동안하는데 찾아보기
  //fileFileter는 diskStorage의 옵션이 아닌데 강사님이 잘못 넣은 것 같음.
});

const fileFilter = (req, file, done) => {
  const ext = path.extname(file.originalname);
  if (ext !== ".mp4") {
    return done(new Error("only mp4 is allowed"), false);
  }
  done(null, true);
};

const upload = multer({ storage, fileFilter }).single("file");

router.post("/uploadfiles", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.status(200).json({
      success: true,
      filePath: res.req.file.path,
      fileName: res.req.file.filename,
    });
  });
});

router.post("/uploadVideo", (req, res) => {
  const video = new Video(req.body);
  video.save((err, videoDoc) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.status(200).json({ success: true });
  });
});

router.post("/getVideoDetail", (req, res) => {
  Video.findOne({ _id: req.body.videoId })
    .populate("writer")
    .exec((err, videoDetail) => {
      if (err) {
        return res.status(400).send(err);
      }
      res.status(200).json({ success: true, videoDetail });
    });
});

router.get("/getVideos", (req, res) => {
  //비디오를 db에서 가져와서 클라에 보낸다.
  Video.find()
    .populate("writer")
    .exec((err, videos) => {
      if (err) {
        return res.staus(400).send(err);
      }
      res.status(200).json({ success: true, videos });
    });
});

router.post("/thumbnails", (req, res) => {
  //섬네일을 생성한다.
  let thumbsFilePath = "";
  let fileDuration = "";
  //ffmpeg.ffprobe('경로', callback)을 하면 metadata(데이터에 대한 데이터)를 얻을 수 있다.
  //여기서 format.duration으로 영상 길이를 추출할 수 있는 것이다.
  ffmpeg.ffprobe(req.body.filePath, (err, metadata) => {
    console.log("metadata.format: ", metadata.format);
    fileDuration = metadata.format.duration;
  });
  //ffmpeg on은 이벤트 filenames는 ffmpeg에 내장된 이벤트일 가능성이 높음.

  //파일 이름을 알아내 파일 경로에 넣어주는 코드
  ffmpeg(req.body.filePath)
    .on("filenames", (filenames) => {
      console.log("Will generate" + filenames.join(", "));
      thumbsFilePath = "uploads/thumbnails/" + filenames[0];
    })
    .on("end", () => {
      console.log("Screenshot taken");
      return res.json({
        success: true,
        filePath: thumbsFilePath,
        fileDuration: fileDuration,
      });
    })
    //에러 핸들러
    .on("error", (err) => {
      console.error(err);
      return res.json({ success: false, err });
    })
    //ffmpeg의 screenshot 메서드는 스샷을 찍을 수 있는 메서드다. count, foler, filename, size를 지정한다.
    //timestamps or timemarks로 스샷을 찍을 시간, 퍼센트 설정가능하다
    //screenshot(options,[dirname])
    //%s
    .screenshot({
      count: 3,
      // uploads와 /uploads의 차이는 무엇인가.
      folder: "uploads/thumbnails",
      size: "320x240",
      filename: "thumbnail-%b.png", //%b는 기본이름을 의미한다.
    });
});
//screenshot filename options
//     '%s': 간격띄우기(초)
//     '%w': 스크린샷 폭
//     '%h': 스크린샷 높이
//     '%r': 스크린샷 해상도('%wx%h'로 표시됨)
//     '%f': 입력 파일 이름
//     '%b': 기본 이름 입력(확장자가 없는 경우 포함)
//     '%i': 상표 배열의 스크린샷 색인(다음과 같이 사용하여 제로 패딩될 수 있음) %000i)

module.exports = router;
