import type { AvatarProps } from "antd";
import { Avatar } from "antd";
import { DownloadOutlined, MessageOutlined } from "@ant-design/icons";

interface ProposalPreviewProps {
  proposal: {
    code?: string;
    customerName: string;
    eventTheme: string;
    eventDate?: string;
    headcount?: number;
    budget?: string;
    understanding?: string;
    planStructure?: { name: string; duration: string }[];
    price?: number;
    includes?: string[];
    excludes?: string[];
    performers?: { name: string; role: string; style: string; avatar?: string }[];
    cases?: { company: string; event: string; feedback?: string; satisfaction?: string }[];
    consultantName?: string;
    consultantPhone?: string;
    serviceNotes?: string;
    validUntil?: string;
    priceDisplayMode?: "full" | "range" | "hidden";
  } | null | undefined;
}

function EmptyState() {
  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        backgroundColor: "var(--yl-bg-page)",
        minHeight: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontSize: "var(--yl-space-12)",
            marginBottom: 12,
            color: "var(--yl-text-tertiary)",
          }}
        >
          📋
        </div>
        <div
          style={{
            font: "var(--yl-text-heading-3)",
            color: "var(--yl-text-primary)",
            marginBottom: 8,
          }}
        >
          暂无方案数据
        </div>
        <div
          style={{
            font: "var(--yl-text-body-md)",
            color: "var(--yl-text-secondary)",
          }}
        >
          请先填写左侧表单
        </div>
      </div>
    </div>
  );
}

function CoverBlock({ proposal }: { proposal: ProposalPreviewProps["proposal"] }) {
  return (
    <div
      style={{
        background: "linear-gradient(160deg, var(--yl-primary), var(--yl-primary-hover))",
        padding: "var(--yl-space-8) var(--yl-space-6)",
        color: "var(--yl-text-on-primary)",
        borderBottomLeftRadius: "var(--yl-radius-lg)",
        borderBottomRightRadius: "var(--yl-radius-lg)",
      }}
    >
      <div
        style={{
          font: "var(--yl-text-caption)",
          opacity: 0.85,
          marginBottom: 24,
        }}
      >
        🏷️ 演立方 · 企业活动方案
      </div>
      <div
        style={{
          font: "var(--yl-text-heading-3)",
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.4,
          marginBottom: 20,
        }}
      >
        {proposal?.customerName || "客户名称"}
        <br />
        {proposal?.eventTheme || "活动主题"}
      </div>
      <div
        style={{
          font: "var(--yl-text-body-sm)",
          opacity: 0.85,
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: 12,
        }}
      >
        <div>专属方案 · 仅供内部使用</div>
        {proposal?.code && (
          <div
            style={{
              fontFamily: "var(--yl-font-mono)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            方案编号：{proposal.code}
          </div>
        )}
        {proposal?.validUntil && (
          <div
            style={{
              fontFamily: "var(--yl-font-mono)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            有效期至：{proposal.validUntil}
          </div>
        )}
      </div>
      {(proposal?.consultantName || proposal?.consultantPhone) && (
        <div
          style={{
            font: "var(--yl-text-body-sm)",
            opacity: 0.75,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          活动顾问：{proposal.consultantName || ""} {proposal.consultantPhone || ""}
        </div>
      )}
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
        }}
      >
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            padding: "0 var(--yl-space-5)",
            borderRadius: "var(--yl-radius-md)",
            border: "1px solid rgba(255,255,255,0.4)",
            backgroundColor: "rgba(255,255,255,0.15)",
            color: "#FFFFFF",
            font: "var(--yl-text-heading-4)",
            cursor: "pointer",
          }}
        >
          <DownloadOutlined />
          下载方案
        </button>
        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            height: 40,
            padding: "0 var(--yl-space-5)",
            borderRadius: "var(--yl-radius-md)",
            border: "1px solid rgba(255,255,255,0.4)",
            backgroundColor: "rgba(255,255,255,0.15)",
            color: "#FFFFFF",
            font: "var(--yl-text-heading-4)",
            cursor: "pointer",
          }}
        >
          <MessageOutlined />
          联系顾问
        </button>
      </div>
    </div>
  );
}

function CardBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: "var(--yl-bg-surface)",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(26,29,46,0.06)",
        padding: 20,
      }}
    >
      <div
        style={{
          font: "var(--yl-text-heading-3)",
          color: "var(--yl-text-primary)",
          marginBottom: 12,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function UnderstandingBlock({ understanding }: { understanding?: string }) {
  return (
    <CardBlock title="📋 我们对需求的理解">
      <p
        style={{
          font: "var(--yl-text-body-md)",
          lineHeight: 1.8,
          color: "var(--yl-text-secondary)",
          margin: 0,
        }}
      >
        {understanding || "请填写需求理解"}
      </p>
    </CardBlock>
  );
}

function PlanStructureBlock({
  planStructure,
}: {
  planStructure?: { name: string; duration: string }[];
}) {
  return (
    <div
      style={{
        marginBottom: 16,
      }}
    >
      <div
        style={{
          font: "var(--yl-text-heading-4)",
          color: "var(--yl-text-secondary)",
          marginBottom: 12,
        }}
      >
        活动结构
      </div>
      <div
        style={{
          position: "relative",
          paddingLeft: 0,
        }}
      >
        {planStructure?.map((item, idx) => (
          <div
            key={idx}
            style={{
              position: "relative",
              paddingLeft: 24,
              paddingBottom: 12,
            }}
          >
            {idx < (planStructure.length - 1) && (
              <div
                style={{
                  position: "absolute",
                  left: 3,
                  top: 10,
                  bottom: 0,
                  width: 2,
                  backgroundColor: "var(--yl-border-default)",
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 6,
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "var(--yl-primary)",
              }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  font: "var(--yl-text-body-md)",
                  color: "var(--yl-text-primary)",
                }}
              >
                {item.name}
              </span>
              <span
                style={{
                  font: "var(--yl-text-body-md)",
                  color: "var(--yl-text-tertiary)",
                  fontFamily: "var(--yl-font-mono)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {item.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetBlock({
  price,
  includes,
  excludes,
  budget,
  priceDisplayMode,
}: {
  price?: number;
  includes?: string[];
  excludes?: string[];
  budget?: string;
  priceDisplayMode?: "full" | "range" | "hidden";
}) {
  const formatPrice = (p: number) => `¥${p.toLocaleString("zh-CN")}`;

  let priceDisplay = price ? formatPrice(price) : "¥0";
  if (priceDisplayMode === "range") {
    priceDisplay = budget || "预算区间";
  } else if (priceDisplayMode === "hidden") {
    priceDisplay = "详询活动顾问";
  }

  return (
    <div
      style={{
        backgroundColor: "var(--yl-bg-page)",
        borderRadius: "var(--yl-radius-md)",
        padding: 16,
      }}
    >
      <div
        style={{
          font: "var(--yl-text-heading-4)",
          color: "var(--yl-text-secondary)",
          marginBottom: 12,
        }}
      >
        预算说明
      </div>
      <div
        style={{
          font: "var(--yl-text-numeric-md)",
          fontWeight: 700,
          color: "var(--yl-text-primary)",
          fontFamily: "var(--yl-font-mono)",
          fontVariantNumeric: "tabular-nums",
          marginBottom: 12,
        }}
      >
        {priceDisplay}
      </div>
      {priceDisplayMode !== "hidden" && includes && includes.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span style={{ font: "var(--yl-text-body-md)", lineHeight: "22px", color: "var(--yl-success)" }}>
            ✅
          </span>
          <span
            style={{
              font: "var(--yl-text-body-md)",
              color: "var(--yl-text-primary)",
              lineHeight: 1.6,
            }}
          >
            包含：{includes.join("、")}
          </span>
        </div>
      )}
      {priceDisplayMode !== "hidden" && excludes && excludes.length > 0 && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          <span style={{ font: "var(--yl-text-body-md)", lineHeight: "22px", color: "var(--yl-error)" }}>
            ❌
          </span>
          <span
            style={{
              font: "var(--yl-text-body-md)",
              color: "var(--yl-text-secondary)",
              lineHeight: 1.6,
            }}
          >
            不含：{excludes.join("、")}
          </span>
        </div>
      )}
    </div>
  );
}

function ProposalBlock({
  planStructure,
  price,
  includes,
  excludes,
  budget,
  priceDisplayMode,
}: {
  planStructure?: { name: string; duration: string }[];
  price?: number;
  includes?: string[];
  excludes?: string[];
  budget?: string;
  priceDisplayMode?: "full" | "range" | "hidden";
}) {
  return (
    <CardBlock title="⭐ 推荐方案">
      <PlanStructureBlock planStructure={planStructure} />
      <BudgetBlock price={price} includes={includes} excludes={excludes} budget={budget} priceDisplayMode={priceDisplayMode} />
    </CardBlock>
  );
}

function PerformerCard({ performer }: { performer: { name: string; role: string; style: string; avatar?: string } }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        backgroundColor: "var(--yl-bg-page)",
        borderRadius: "var(--yl-radius-md)",
        padding: 12,
      }}
    >
      <Avatar
        size={48}
        style={{
          backgroundColor: "var(--yl-border-default)",
          color: "var(--yl-text-secondary)",
          font: "var(--yl-text-heading-4)",
        }}
        src={performer.avatar || undefined}
      >
        {performer.name[0]}
      </Avatar>
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            font: "var(--yl-text-heading-4)",
            color: "var(--yl-text-primary)",
          }}
        >
          {performer.name}
        </div>
        <div
          style={{
            font: "var(--yl-text-caption)",
            color: "var(--yl-text-secondary)",
            marginTop: "var(--yl-space-1)",
          }}
        >
          {performer.role}
        </div>
        <div
          style={{
            font: "var(--yl-text-caption)",
            color: "var(--yl-text-tertiary)",
            marginTop: "var(--yl-space-1)",
          }}
        >
          {performer.style}
        </div>
      </div>
    </div>
  );
}

function TeamBlock({ performers }: { performers?: { name: string; role: string; style: string; avatar?: string }[] }) {
  const displayPerformers = performers?.slice(0, 3) || [];
  const extraCount = performers ? performers.length - 3 : 0;

  return (
    <CardBlock title="🎤 推荐内容团队">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {displayPerformers.map((performer, idx) => (
          <PerformerCard key={idx} performer={performer} />
        ))}
        {extraCount > 0 && (
          <div
            style={{
              font: "var(--yl-text-body-sm)",
              color: "var(--yl-text-tertiary)",
              textAlign: "center",
              paddingTop: 4,
            }}
          >
            +{extraCount} 位演员
          </div>
        )}
      </div>
    </CardBlock>
  );
}

function CaseBlock({ cases }: { cases?: { company: string; event: string; feedback?: string; satisfaction?: string }[] }) {
  if (!cases || cases.length === 0) {
    return null;
  }

  const displayCases = cases.slice(0, 2);

  return (
    <CardBlock title="📌 类似活动案例">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {displayCases.map((c, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "var(--yl-bg-page)",
              borderRadius: "var(--yl-radius-md)",
              padding: 14,
            }}
          >
            <div
                style={{
                  font: "var(--yl-text-heading-4)",
                  color: "var(--yl-text-primary)",
                  marginBottom: 4,
                }}
              >
                🏢 {c.company}
              </div>
              <div
                style={{
                  font: "var(--yl-text-body-sm)",
                  color: "var(--yl-text-secondary)",
                  marginBottom: 4,
                }}
              >
                {c.event}
              </div>
              {c.satisfaction && (
                <div
                  style={{
                    font: "var(--yl-text-caption)",
                    color: "var(--yl-success)",
                    fontWeight: 500,
                  }}
                >
                客户满意度：{c.satisfaction}
              </div>
            )}
          </div>
        ))}
      </div>
    </CardBlock>
  );
}

function ServiceBlock({
  includes,
  excludes,
  serviceNotes,
}: {
  includes?: string[];
  excludes?: string[];
  serviceNotes?: string;
}) {
  return (
    <CardBlock title="📝 服务说明">
      {includes && includes.length > 0 && (
        <div
          style={{
            marginBottom: 16,
          }}
        >
          <div
            style={{
              font: "var(--yl-text-heading-4)",
              color: "var(--yl-success)",
              marginBottom: 8,
            }}
          >
            ✅ 包含项目
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {includes.map((item, idx) => (
              <div
                key={idx}
                style={{
                  font: "var(--yl-text-body-md)",
                  color: "var(--yl-text-primary)",
                  paddingLeft: 12,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 6,
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    backgroundColor: "var(--yl-primary)",
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
      {excludes && excludes.length > 0 && (
        <div
          style={{
            marginBottom: 16,
          }}
        >
          <div
            style={{
              font: "var(--yl-text-heading-4)",
              color: "var(--yl-error)",
              marginBottom: 8,
            }}
          >
            ❌ 不包含项目
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {excludes.map((item, idx) => (
              <div
                key={idx}
                style={{
                  font: "var(--yl-text-body-md)",
                  color: "var(--yl-text-secondary)",
                  paddingLeft: 12,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 6,
                    width: 4,
                    height: 4,
                    borderRadius: "50%",
                    backgroundColor: "var(--yl-text-tertiary)",
                  }}
                />
                {item}
              </div>
            ))}
          </div>
        </div>
      )}
      {serviceNotes && (
        <div
          style={{
            font: "var(--yl-text-caption)",
            color: "var(--yl-text-tertiary)",
            fontStyle: "italic",
          }}
        >
          ⚠️ {serviceNotes}
        </div>
      )}
    </CardBlock>
  );
}

function FooterBlock() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          font: "var(--yl-text-caption-xs)",
          color: "var(--yl-text-tertiary)",
        }}
      >
        Powered by 演立方
      </div>
    </div>
  );
}

export function ProposalPreview({ proposal }: ProposalPreviewProps) {
  if (!proposal) {
    return <EmptyState />;
  }

  return (
    <div
      style={{
        maxWidth: 420,
        margin: "0 auto",
        backgroundColor: "var(--yl-bg-page)",
        maxHeight: 600,
        overflowY: "auto",
        padding: 16,
      }}
    >
      <CoverBlock proposal={proposal} />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: "var(--yl-space-4)",
        }}
      >
        <UnderstandingBlock understanding={proposal.understanding} />
        <ProposalBlock
          planStructure={proposal.planStructure}
          price={proposal.price}
          includes={proposal.includes}
          excludes={proposal.excludes}
          budget={proposal.budget}
          priceDisplayMode={proposal.priceDisplayMode}
        />
        <TeamBlock performers={proposal.performers} />
        <CaseBlock cases={proposal.cases} />
        <ServiceBlock
          includes={proposal.includes}
          excludes={proposal.excludes}
          serviceNotes={proposal.serviceNotes}
        />
      </div>
      <FooterBlock />
    </div>
  );
}
