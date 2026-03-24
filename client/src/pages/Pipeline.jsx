import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import { Sidebar } from "./Dashboard";
import api from "../services/api";
import toast from "react-hot-toast";

const formatValue = (val, currency = "₹") => {
  if (!val || val === 0) return null;
  if (val >= 10000000) return `${currency}${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `${currency}${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${currency}${(val / 1000).toFixed(0)}K`;
  return `${currency}${val}`;
};

const SVG = {
  fire: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="#F59E0B">
      <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7 7 7 0 01-7-7c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z" />
    </svg>
  ),
  whatsapp: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  ),
  plus: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  close: (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

const Pipeline = () => {
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [draggedLead, setDraggedLead] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(null);
  const [quickForm, setQuickForm] = useState({
    name: "",
    phone: "",
    value: "",
  });
  const [adding, setAdding] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const term = user?.nicheConfig?.terminology;
  const stages = user?.nicheConfig?.pipelineStages || [];

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const res = await api.get("/leads/pipeline");
      setColumns(res.data.pipeline);
    } catch {
      toast.error("Failed to load pipeline");
    } finally {
      setLoading(false);
    }
  };

  // Drag handlers
  const onDragStart = (e, lead, stageId) => {
    setDraggedLead({ lead, fromStage: stageId });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", lead._id);
  };

  const onDragOver = (e, stageId) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStage !== stageId) setDragOverStage(stageId);
  };

  const onDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverStage(null);
    }
  };

  const onDrop = async (e, toStageId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverStage(null);

    if (!draggedLead || draggedLead.fromStage === toStageId) {
      setDraggedLead(null);
      return;
    }

    const lead = draggedLead.lead;
    const fromStage = draggedLead.fromStage;
    setDraggedLead(null);

    // Optimistic update — move card immediately in UI
    setColumns((prev) => {
      const next = { ...prev };
      const fromLeads = [...(next[fromStage]?.leads || [])];
      const toLeads = [...(next[toStageId]?.leads || [])];
      const idx = fromLeads.findIndex((l) => l._id === lead._id);
      if (idx === -1) return prev;
      const [moved] = fromLeads.splice(idx, 1);
      moved.stage = toStageId;
      toLeads.unshift(moved);
      next[fromStage] = {
        ...next[fromStage],
        leads: fromLeads,
        count: fromLeads.length,
        value: fromLeads.reduce((s, l) => s + (l.value || 0), 0),
      };
      next[toStageId] = {
        ...next[toStageId],
        leads: toLeads,
        count: toLeads.length,
        value: toLeads.reduce((s, l) => s + (l.value || 0), 0),
      };
      return next;
    });

    try {
      await api.patch(`/leads/${lead._id}/stage`, { stage: toStageId });
      const stageName = stages.find((s) => s.id === toStageId)?.label;
      toast.success(`Moved to ${stageName}`);
    } catch {
      toast.error("Failed to move — refreshing");
      fetchPipeline();
    }
  };

  const handleQuickAdd = async (stageId) => {
    if (!quickForm.name.trim()) return toast.error("Name required");
    setAdding(true);
    try {
      await api.post("/leads", {
        name: quickForm.name,
        phone: quickForm.phone,
        value: parseInt(quickForm.value) || 0,
        stage: stageId,
      });
      toast.success("Added!");
      setShowQuickAdd(null);
      setQuickForm({ name: "", phone: "", value: "" });
      fetchPipeline();
    } catch {
      toast.error("Failed");
    } finally {
      setAdding(false);
    }
  };

  const handleWhatsApp = async (lead, e) => {
    e.stopPropagation();
    try {
      const res = await api.get(`/leads/${lead._id}/whatsapp`);
      window.open(res.data.waUrl, "_blank");
    } catch {
      toast.error("Failed");
    }
  };

  const totalValue = Object.values(columns).reduce(
    (s, c) => s + (c.value || 0),
    0,
  );
  const totalLeads = Object.values(columns).reduce(
    (s, c) => s + (c.count || 0),
    0,
  );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #06060E 0%, #0D0A1E 50%, #060612 100%)",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#F0EEE9",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');
        * { box-sizing: border-box; }

        .glass-col {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          transition: all 0.2s ease;
        }
        .glass-col.drag-over {
          background: rgba(139,92,246,0.08) !important;
          border-color: rgba(139,92,246,0.4) !important;
          box-shadow: 0 0 24px rgba(139,92,246,0.12), inset 0 0 24px rgba(139,92,246,0.04);
        }

        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 11px 12px;
          cursor: grab;
          transition: all 0.2s ease;
          user-select: none;
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(139,92,246,0.25);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(139,92,246,0.1);
        }
        .glass-card:active { cursor: grabbing; }
        .glass-card.dragging {
          opacity: 0.35;
          transform: scale(0.96) rotate(1deg);
          box-shadow: none;
        }

        .glass-input {
          width: 100%;
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 8px 10px;
          color: #F0EEE9;
          font-size: 12px;
          font-family: inherit;
          outline: none;
          transition: all 0.2s;
        }
        .glass-input:focus {
          border-color: rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.06);
          box-shadow: 0 0 0 3px rgba(139,92,246,0.08);
        }
        .glass-input::placeholder { color: rgba(240,238,233,0.2); }

        .add-btn {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px dashed rgba(255,255,255,0.1);
          border-radius: 9px;
          padding: 8px;
          cursor: pointer;
          color: rgba(240,238,233,0.25);
          font-size: 11px;
          font-family: inherit;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          transition: all 0.2s;
        }
        .add-btn:hover {
          border-color: rgba(139,92,246,0.4);
          background: rgba(139,92,246,0.05);
          color: #8B5CF6;
        }

        .wa-pill {
          background: rgba(37,211,102,0.1);
          border: 1px solid rgba(37,211,102,0.2);
          border-radius: 5px;
          padding: 3px 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: all 0.15s;
        }
        .wa-pill:hover { background: rgba(37,211,102,0.2); transform: scale(1.05); }

        .submit-pill {
          flex: 1;
          background: linear-gradient(135deg, #8B5CF6, #5B21B6);
          border: none;
          border-radius: 7px;
          padding: 7px;
          cursor: pointer;
          color: #fff;
          font-size: 11px;
          font-weight: 600;
          font-family: inherit;
          transition: all 0.2s;
        }
        .submit-pill:hover { box-shadow: 0 4px 12px rgba(139,92,246,0.4); }

        .cancel-pill {
          background: rgba(255,255,255,0.05);
          border: none;
          border-radius: 7px;
          padding: 7px 9px;
          cursor: pointer;
          color: rgba(240,238,233,0.4);
          display: flex;
          align-items: center;
          transition: background 0.15s;
        }
        .cancel-pill:hover { background: rgba(255,255,255,0.1); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fa { animation: fadeUp 0.3s ease both; }

        @media(max-width:768px){ .sidebar-d{display:none!important} }

        /* Custom scrollbar for kanban */
        .kanban-scroll::-webkit-scrollbar { height: 4px; }
        .kanban-scroll::-webkit-scrollbar-track { background: transparent; }
        .kanban-scroll::-webkit-scrollbar-thumb { background: rgba(139,92,246,0.2); border-radius: 2px; }

        .col-scroll::-webkit-scrollbar { width: 3px; }
        .col-scroll::-webkit-scrollbar-track { background: transparent; }
        .col-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      <div className="sidebar-d">
        <Sidebar active="/pipeline" />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="fa"
          style={{
            padding: "20px 24px 14px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(255,255,255,0.02)",
            backdropFilter: "blur(20px)",
            flexShrink: 0,
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: "20px",
                fontWeight: 800,
                letterSpacing: "-0.5px",
                marginBottom: "3px",
              }}
            >
              {term?.pipeline || "Pipeline"}
            </h1>
            <p
              style={{
                fontSize: "12px",
                color: "rgba(240,238,233,0.35)",
                fontWeight: 300,
              }}
            >
              {totalLeads} {term?.leads || "leads"} · {formatValue(totalValue)}{" "}
              total value · drag cards to move between stages
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => navigate("/leads")}
              style={{
                background: "rgba(255,255,255,0.04)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "9px",
                padding: "9px 14px",
                cursor: "pointer",
                color: "rgba(240,238,233,0.5)",
                fontSize: "13px",
                fontFamily: "inherit",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)";
                e.currentTarget.style.color = "#8B5CF6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "rgba(240,238,233,0.5)";
              }}
            >
              List View →
            </button>
          </div>
        </div>

        {/* Stage summary pills */}
        <div
          style={{
            padding: "10px 24px",
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            flexShrink: 0,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {stages.map((stage) => {
            const col = columns[stage.id] || { count: 0, value: 0 };
            return (
              <div
                key={stage.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background:
                    col.count > 0
                      ? `${stage.color}10`
                      : "rgba(255,255,255,0.02)",
                  border: `1px solid ${col.count > 0 ? stage.color + "20" : "rgba(255,255,255,0.05)"}`,
                  flexShrink: 0,
                  backdropFilter: "blur(10px)",
                  cursor: "default",
                }}
              >
                <span style={{ fontSize: "11px" }}>{stage.emoji}</span>
                <p
                  style={{
                    fontSize: "11px",
                    color:
                      col.count > 0
                        ? "rgba(240,238,233,0.6)"
                        : "rgba(240,238,233,0.2)",
                    fontWeight: 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  {stage.label}
                </p>
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontSize: "11px",
                    fontWeight: 800,
                    color:
                      col.count > 0 ? stage.color : "rgba(240,238,233,0.15)",
                  }}
                >
                  {col.count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Kanban Board */}
        {loading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{ textAlign: "center", color: "rgba(240,238,233,0.3)" }}
            >
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  border: "2px solid rgba(139,92,246,0.3)",
                  borderTopColor: "#8B5CF6",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 10px",
                }}
              />
              <p style={{ fontSize: "13px", fontWeight: 300 }}>
                Loading pipeline...
              </p>
            </div>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div
            className="kanban-scroll"
            style={{
              flex: 1,
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              overflowY: "hidden",
              padding: "16px 20px",
            }}
          >
            {stages.map((stage) => {
              const col = columns[stage.id] || {
                leads: [],
                count: 0,
                value: 0,
              };
              const isDragOver = dragOverStage === stage.id;

              return (
                <div
                  key={stage.id}
                  className={`glass-col ${isDragOver ? "drag-over" : ""}`}
                  onDragOver={(e) => onDragOver(e, stage.id)}
                  onDragLeave={onDragLeave}
                  onDrop={(e) => onDrop(e, stage.id)}
                  style={{
                    minWidth: "210px",
                    maxWidth: "210px",
                    display: "flex",
                    flexDirection: "column",
                    flexShrink: 0,
                    overflow: "hidden",
                  }}
                >
                  {/* Column header */}
                  <div style={{ padding: "12px 14px 10px", flexShrink: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "3px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                        }}
                      >
                        <span style={{ fontSize: "14px" }}>{stage.emoji}</span>
                        <p
                          style={{
                            fontSize: "12px",
                            fontWeight: 600,
                            color:
                              col.count > 0
                                ? "#F0EEE9"
                                : "rgba(240,238,233,0.35)",
                          }}
                        >
                          {stage.label}
                        </p>
                      </div>
                      <div
                        style={{
                          background:
                            col.count > 0
                              ? `${stage.color}20`
                              : "rgba(255,255,255,0.05)",
                          borderRadius: "20px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontWeight: 800,
                          color:
                            col.count > 0
                              ? stage.color
                              : "rgba(240,238,233,0.2)",
                          fontFamily: "'Syne', sans-serif",
                        }}
                      >
                        {col.count}
                      </div>
                    </div>
                    {col.value > 0 && (
                      <p
                        style={{
                          fontSize: "10px",
                          color: "rgba(240,238,233,0.3)",
                          fontWeight: 300,
                          marginBottom: "8px",
                        }}
                      >
                        {formatValue(col.value)}
                      </p>
                    )}
                    {/* Stage color bar */}
                    <div
                      style={{
                        height: "2px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "1px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: col.count > 0 ? "100%" : "0",
                          background: stage.color,
                          opacity: 0.7,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Cards */}
                  <div
                    className="col-scroll"
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "4px 8px 8px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                      minHeight: "60px",
                    }}
                  >
                    {col.leads?.map((lead) => (
                      <div
                        key={lead._id}
                        draggable="true"
                        onDragStart={(e) => onDragStart(e, lead, stage.id)}
                        onDragEnd={() => {
                          setDraggedLead(null);
                          setDragOverStage(null);
                        }}
                        className={`glass-card ${draggedLead?.lead._id === lead._id ? "dragging" : ""}`}
                        onClick={() => navigate("/leads")}
                      >
                        {/* Hot badge */}
                        {lead.isHot && (
                          <div style={{ marginBottom: "6px" }}>
                            <span
                              style={{
                                background: "rgba(245,158,11,0.15)",
                                border: "1px solid rgba(245,158,11,0.2)",
                                borderRadius: "20px",
                                padding: "1px 7px",
                                fontSize: "9px",
                                fontWeight: 700,
                                color: "#F59E0B",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "3px",
                                letterSpacing: "0.5px",
                              }}
                            >
                              {SVG.fire} HOT
                            </span>
                          </div>
                        )}

                        {/* Name */}
                        <div
                          style={{
                            display: "flex",
                            gap: "7px",
                            alignItems: "center",
                            marginBottom: "6px",
                          }}
                        >
                          <div
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              background: `${stage.color}15`,
                              border: `1px solid ${stage.color}20`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "10px",
                              fontWeight: 700,
                              color: stage.color,
                              flexShrink: 0,
                            }}
                          >
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p
                              style={{
                                fontSize: "12px",
                                fontWeight: 600,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: "#F0EEE9",
                              }}
                            >
                              {lead.name}
                            </p>
                            {lead.phone && (
                              <p
                                style={{
                                  fontSize: "10px",
                                  color: "rgba(240,238,233,0.3)",
                                  fontWeight: 300,
                                }}
                              >
                                {lead.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* First custom field */}
                        {lead.customFields &&
                          (() => {
                            const fields =
                              lead.customFields || lead.customfields || {};
                            const entries = Object.entries(fields).filter(
                              ([, v]) => v,
                            );
                            return entries[0] ? (
                              <p
                                style={{
                                  fontSize: "10px",
                                  color: "rgba(240,238,233,0.35)",
                                  marginBottom: "7px",
                                  fontWeight: 300,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {entries[0][1]}
                              </p>
                            ) : null;
                          })()}

                        {/* Bottom */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          {lead.value > 0 ? (
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 700,
                                color: "#10B981",
                                fontFamily: "'Syne', sans-serif",
                              }}
                            >
                              {formatValue(lead.value)}
                            </span>
                          ) : (
                            <span />
                          )}
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                              alignItems: "center",
                            }}
                          >
                            {lead.nextFollowUpAt &&
                              new Date(lead.nextFollowUpAt) < new Date() && (
                                <span
                                  style={{
                                    background: "rgba(239,68,68,0.12)",
                                    border: "1px solid rgba(239,68,68,0.2)",
                                    borderRadius: "4px",
                                    padding: "2px 5px",
                                    fontSize: "8px",
                                    color: "#EF4444",
                                    fontWeight: 700,
                                    letterSpacing: "0.5px",
                                  }}
                                >
                                  DUE
                                </span>
                              )}
                            {lead.phone && (
                              <button
                                className="wa-pill"
                                onClick={(e) => handleWhatsApp(lead, e)}
                              >
                                {SVG.whatsapp}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty drop zone */}
                    {col.leads?.length === 0 && (
                      <div
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: "80px",
                          border: "1px dashed rgba(255,255,255,0.06)",
                          borderRadius: "10px",
                          color: "rgba(240,238,233,0.12)",
                        }}
                      >
                        <p style={{ fontSize: "11px", fontWeight: 300 }}>
                          Drop here
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick add */}
                  <div
                    style={{
                      padding: "8px",
                      borderTop: "1px solid rgba(255,255,255,0.04)",
                      flexShrink: 0,
                    }}
                  >
                    {showQuickAdd === stage.id ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "5px",
                        }}
                      >
                        <input
                          className="glass-input"
                          type="text"
                          placeholder="Name *"
                          autoFocus
                          value={quickForm.name}
                          onChange={(e) =>
                            setQuickForm({ ...quickForm, name: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleQuickAdd(stage.id);
                            if (e.key === "Escape") setShowQuickAdd(null);
                          }}
                        />
                        <input
                          className="glass-input"
                          type="tel"
                          placeholder="Phone"
                          value={quickForm.phone}
                          onChange={(e) =>
                            setQuickForm({
                              ...quickForm,
                              phone: e.target.value,
                            })
                          }
                        />
                        <input
                          className="glass-input"
                          type="number"
                          placeholder="Value (₹)"
                          value={quickForm.value}
                          onChange={(e) =>
                            setQuickForm({
                              ...quickForm,
                              value: e.target.value,
                            })
                          }
                        />
                        <div style={{ display: "flex", gap: "5px" }}>
                          <button
                            className="submit-pill"
                            onClick={() => handleQuickAdd(stage.id)}
                            disabled={adding}
                          >
                            {adding ? "..." : "Add"}
                          </button>
                          <button
                            className="cancel-pill"
                            onClick={() => {
                              setShowQuickAdd(null);
                              setQuickForm({ name: "", phone: "", value: "" });
                            }}
                          >
                            {SVG.close}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="add-btn"
                        onClick={() => {
                          setShowQuickAdd(stage.id);
                          setQuickForm({ name: "", phone: "", value: "" });
                        }}
                      >
                        {SVG.plus} Quick add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pipeline;
