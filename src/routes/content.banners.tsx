import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { PageHeader, Panel, Btn, StatusBadge, Modal, Field, Input, Select } from "@/components/admin/ui";
import { Image as ImageIcon, Video as VideoIcon, Play } from "lucide-react";

export const Route = createFileRoute("/content/banners")({
  head: () => ({ meta: [{ title: "Banners — TRANS8" }] }),
  component: BannersPage,
});

interface Banner {
  id: number;
  title: string;
  type: "image" | "video";
  mediaUrl: string;
  status: string;
}

function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([
    { id: 1, title: "Eid Promo 2026", type: "image", mediaUrl: "", status: "Active" },
    { id: 2, title: "UAE Free-zone discount", type: "image", mediaUrl: "", status: "Active" },
    { id: 3, title: "Sea freight rate drop", type: "video", mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4", status: "Active" },
    { id: 4, title: "Karachi-Dubai express", type: "video", mediaUrl: "https://www.w3schools.com/html/movie.mp4", status: "Pending" },
    { id: 5, title: "Winter trucking campaigns", type: "image", mediaUrl: "", status: "Active" },
  ]);

  const [editing, setEditing] = useState<Banner | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftType, setDraftType] = useState<"image" | "video">("image");
  const [draftUrl, setDraftUrl] = useState("");

  const open = (b?: Banner) => {
    setEditing(b ?? { id: 0, title: "", type: "image", mediaUrl: "", status: "Pending" });
    setDraftTitle(b?.title ?? "");
    setDraftType(b?.type ?? "image");
    setDraftUrl(b?.mediaUrl ?? "");
  };

  const save = () => {
    if (!draftTitle.trim()) { toast.error("Title required"); return; }
    if (draftType === "video" && !draftUrl.trim()) { toast.error("Media URL required for video banner"); return; }

    if (editing!.id === 0) {
      const id = Math.max(0, ...banners.map((b) => b.id)) + 1;
      setBanners([{ id, title: draftTitle, type: draftType, mediaUrl: draftUrl, status: "Pending" }, ...banners]);
      toast.success("Banner created successfully!");
    } else {
      setBanners(banners.map((b) => b.id === editing!.id ? { ...b, title: draftTitle, type: draftType, mediaUrl: draftUrl } : b));
      toast.success("Banner updated successfully!");
    }
    setEditing(null);
  };

  const del = (id: number) => {
    setBanners(banners.filter((b) => b.id !== id));
    toast.success("Banner deleted");
  };

  return (
    <AdminLayout>
      <PageHeader title="Banners" subtitle={`${banners.length} promotional banners`} actions={<Btn onClick={() => open()}>+ New Banner</Btn>} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((b) => (
          <Panel key={b.id}>
            <div className="h-32 -mx-5 -mt-5 mb-4 relative bg-gradient-to-br from-primary/30 to-[var(--surface-2)] border-b border-border overflow-hidden grid place-items-center">
              {b.type === "video" && b.mediaUrl ? (
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                  <video src={b.mediaUrl} muted loop autoPlay className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                    <div className="h-9 w-9 rounded-full bg-primary/80 flex items-center justify-center text-white">
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <ImageIcon className="h-10 w-10 text-primary" />
              )}
              <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                {b.type === "video" ? <VideoIcon className="h-3 w-3" /> : <ImageIcon className="h-3 w-3" />}
                {b.type}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-display font-bold text-sm truncate max-w-[70%]">{b.title}</div>
              <StatusBadge status={b.status} />
            </div>
            <div className="flex gap-2 mt-4">
              <Btn variant="secondary" className="flex-1 text-xs h-8" onClick={() => open(b)}>Edit</Btn>
              <Btn variant="danger" className="text-xs h-8" onClick={() => del(b.id)}>Delete</Btn>
            </div>
          </Panel>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Banner" : "New Banner"}
        footer={<><Btn variant="ghost" onClick={() => setEditing(null)}>Cancel</Btn><Btn onClick={save}>Save</Btn></>}>
        <div className="space-y-4">
          <Field label="Banner title">
            <Input className="w-full" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="Campaign title" />
          </Field>
          <Field label="Banner Type">
            <Select className="w-full" value={draftType} onChange={(e) => setDraftType(e.target.value as "image" | "video")}>
              <option value="image">Image Banner</option>
              <option value="video">Video Banner</option>
            </Select>
          </Field>
          {draftType === "video" && (
            <Field label="Video URL">
              <Input className="w-full" value={draftUrl} onChange={(e) => setDraftUrl(e.target.value)} placeholder="https://domain.com/video.mp4" />
            </Field>
          )}
        </div>
      </Modal>
    </AdminLayout>
  );
}