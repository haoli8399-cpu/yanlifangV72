import { Button, message } from "antd";
import { DownloadOutlined, EyeOutlined } from "@ant-design/icons";

// ============================================================
// DownloadButton — 方案下载/预览入口
// client模式：触发留资下载
// sales模式：新标签页打开客户H5预览
// ============================================================

interface DownloadButtonProps {
  proposalCode: string;
  variant: "client" | "sales";
}

export function DownloadButton({ proposalCode, variant }: DownloadButtonProps) {
  const handleClick = () => {
    if (variant === "client") {
      // TODO: 接入真实下载服务
      // 客户端模式：模拟留资后发送下载链接
      message.success(
        "方案下载链接已发送至您的手机，活动顾问将稍后联系",
        3
      );
    } else {
      // 销售端模式：新标签页打开客户H5预览
      const url = `/p/${proposalCode}`;
      window.open(url, "_blank");
    }
  };

  return (
    <Button
      icon={variant === "client" ? <DownloadOutlined /> : <EyeOutlined />}
      onClick={handleClick}
      style={{ borderRadius: 8, height: 40 }}
    >
      {variant === "client" ? "下载方案" : "预览下载"}
    </Button>
  );
}
