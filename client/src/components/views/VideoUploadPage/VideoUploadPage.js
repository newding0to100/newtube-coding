import React, { useState } from "react";
import { Typography, Input, message, Button, Icon, Form, Spin } from "antd";
import Dropzone from "react-dropzone";
import axios from "axios";
import { useSelector } from "react-redux";

const { Title } = Typography;
const { TextArea } = Input;

function VideoUploadPage(props) {
  const writer = useSelector((state) => state.user);

  const privateOptions = [
    { value: 0, label: "Private" },
    { value: 1, label: "Public" },
  ];
  const categoryOptions = [
    { value: 0, label: "Programming" },
    { value: 1, label: "Music" },
    { value: 2, label: "Sports" },
    { value: 3, label: "VLOG" },
  ];

  const [VideoTitle, setVideoTitle] = useState("");
  const [Description, setDescription] = useState("");
  const [Private, setPrivate] = useState(0);
  const [Category, setCategory] = useState("Film & Animation");
  const [FilePath, setFilePath] = useState("");
  const [ThumbFilePath, setThumbFilePath] = useState("");
  const [Duration, setDuration] = useState("");
  const onChangeTitle = (event) => {
    setVideoTitle(event.currentTarget.value);
  };
  const onChangeDescription = (event) => {
    setDescription(event.currentTarget.value);
  };
  const onChangePrivate = (event) => {
    setPrivate(event.currentTarget.value);
  };
  const onChangeCategory = (event) => {
    setCategory(event.currentTarget.value);
  };

  const onDrop = (files) => {
    //서버에 file과 content-type을 보내줘야 한다.
    const formData = new FormData();
    formData.append("file", files[0]);
    const config = {
      header: { "Content-type": "multipart/form-data" },
    };
    axios.post("/api/video/uploadfiles", formData, config).then((response) => {
      if (response.data.success) {
        setFilePath(response.data.filePath);
        const fileData = {
          filePath: response.data.filePath,
          fileName: response.data.fileName,
        };
        //섬네일을 만들어줘야 합니다.
        axios.post("/api/video/thumbnails", fileData).then((response) => {
          if (response.data.success) {
            setThumbFilePath(response.data.filePath);
            setDuration(response.data.fileDuration);
          } else {
            alert("섬네일 생성 실패하였습니다.");
          }
        });
      } else {
        alert("비디오 업로드에 실패했습니다.");
      }
    });
  };

  const onSubmit = (event) => {
    event.preventDefault();
    const VideoAndThumbnailData = {
      writer: writer.userData._id,
      filePath: FilePath,
      thumbnail: ThumbFilePath,
      title: VideoTitle,
      description: Description,
      category: Category,
      private: Private,
      duration: Duration,
    };

    axios
      .post("/api/video/uploadVideo", VideoAndThumbnailData)
      .then((response) => {
        if (response.data.success) {
          message.success("비디오 업로드 성공");
          setTimeout(() => {
            props.history.push("/");
          }, 3000);
        } else {
          console.log(response.data);
          alert("비디오 업로드 실패");
        }
      });
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto" }}>
      <div style={{ textAlign: "center" }}>
        <Title>Upload Video</Title>
      </div>
      <Form onSubmit={onSubmit}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {/* Dropzone */}
          <Dropzone onDrop={onDrop} multiple={false} maxSize={1000000000000}>
            {({ getRootProps, getInputProps }) => (
              <div
                style={{
                  width: "300px",
                  height: "240px",
                  border: "1px solid lightgrey",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <Icon type="plus" style={{ fontSize: "3rem" }} />
              </div>
            )}
          </Dropzone>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "50%",
            }}
          >
            {ThumbFilePath ? (
              <div>
                <img
                  src={`http://localhost:5000/${ThumbFilePath}`}
                  alt="Thumbnail"
                />
              </div>
            ) : (
              <div>
                <Spin />
              </div>
            )}
          </div>
        </div>
        <br />
        <br />
        <label>Title</label>
        <Input value={VideoTitle} onChange={onChangeTitle} />
        <br />
        <br />
        <label>Description</label>
        <TextArea value={Description} onChange={onChangeDescription} />
        <br />
        <br />
        {/* select에서 value는 선택했을 때 서버에 전송되는 값이다. 
           그렇다면 Private에서 숫자를 보내는 것은 합리적인가?
        */}
        <select onChange={onChangePrivate}>
          {privateOptions.map((item, index) => (
            <option key={index} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <br />
        <br />
        <select onChange={onChangeCategory}>
          {categoryOptions.map((item, index) => (
            <option key={index} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
        <br />
        <br />
        <Button type="primary" size="large" onClick={onSubmit}>
          Upload
        </Button>
      </Form>
    </div>
  );
}

export default VideoUploadPage;
