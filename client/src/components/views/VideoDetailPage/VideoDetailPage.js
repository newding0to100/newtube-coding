import React, { useEffect, useState } from "react";
import { Row, Col, List, Avatar, Spin } from "antd";
//한 Row가 24다. 이것을 기준으로 나누면 된다.
import axios from "axios";
import SideVideo from "./Section/SideVideo";

function VideoDetailPage(props) {
  const videoId = { videoId: props.match.params.videoId };

  const [VideoDetail, setVideoDetail] = useState([]);

  useEffect(() => {
    axios.post("/api/video/getVideoDetail", videoId).then((response) => {
      if (response.data.success) {
        setVideoDetail(response.data.videoDetail);
        console.log(response.data);
        console.log(response.data.videoDetail);

        console.log("VideoDetail", VideoDetail);
      } else {
        alert("비디오 가져오기에 실패하였습니다.");
      }
    });
  }, []);
  if (VideoDetail.writer) {
    return (
      <Row gutter={[16, 16]}>
        <Col lg={18} xs={24}>
          <div style={{ width: "100%", padding: "3rem 4rem" }}>
            <video
              style={{ width: "100%" }}
              src={`http://localhost:5000/${VideoDetail.filePath}`}
              controls
            />

            <List.Item actions>
              <List.Item.Meta
                avatar={<Avatar src={VideoDetail.writer.image} />}
                title={VideoDetail.writer.name}
                description={VideoDetail.description}
              />
            </List.Item>
            {/* Comments */}
          </div>
        </Col>
        <Col lg={6} xs={24}>
          <SideVideo />
        </Col>
      </Row>
    );
  } else {
    return <Spin />;
  }
}

export default VideoDetailPage;
