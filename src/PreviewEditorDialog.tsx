import { Check, Trash2 } from "lucide-react";
import { ComponentFields } from "./Editor";
import { Field, Modal, readImage } from "./ui";
import type { ResumeData, UpdateResume } from "./types";
import type { DragTarget } from "./PreviewInteraction";

export type EditingTarget = DragTarget | "personal";

export default function PreviewEditorDialog({
  target,
  data,
  update,
  onClose,
  toast,
}: {
  target: EditingTarget;
  data: ResumeData;
  update: UpdateResume;
  onClose: () => void;
  toast: (message: string) => void;
}) {
  const section =
    target !== "personal"
      ? data.sections.find((s) => s.id === target.section)
      : undefined;
  const component =
    target !== "personal"
      ? section?.components.find((c) => c.id === target.component)
      : undefined;
  const setPersonal = (key: keyof ResumeData, value: string) =>
    update((current) => ({ ...current, [key]: value }));
  if (target !== "personal" && !section) return null;
  return (
    <Modal
      title={
        target === "personal"
          ? "编辑个人信息"
          : `编辑 · ${component?.title || section?.title || "组件"}`
      }
      subtitle="修改会实时反映在简历中，完成后可继续拖拽编排。"
      onClose={onClose}
      wide
    >
      <div className="preview-dialog-fields">
        {target === "personal" ? (
          <>
            <div className="form-grid">
              <Field
                label="姓名"
                value={data.name}
                onChange={(v) => setPersonal("name", v)}
              />
              <Field
                label="所在城市"
                value={data.location}
                onChange={(v) => setPersonal("location", v)}
              />
            </div>
            <Field
              label="职业 / 求职意向"
              value={data.role}
              onChange={(v) => setPersonal("role", v)}
            />
            <div className="form-grid">
              <Field
                label="电子邮箱"
                value={data.email}
                onChange={(v) => setPersonal("email", v)}
              />
              <Field
                label="联系电话"
                value={data.phone}
                onChange={(v) => setPersonal("phone", v)}
              />
            </div>
            <Field
              label="个人网站 / 作品集"
              value={data.website}
              onChange={(v) => setPersonal("website", v)}
            />
            <label className="image-input-label">
              {data.photo ? "更换个人照片" : "上传个人照片"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  readImage(
                    e.target.files?.[0],
                    (v) => setPersonal("photo", v),
                    toast,
                  );
                  e.target.value = "";
                }}
              />
            </label>
            {data.photo && (
              <button
                className="text-button remove-dialog-photo"
                onClick={() => setPersonal("photo", "")}
              >
                移除照片
              </button>
            )}
          </>
        ) : !component && section ? (
          <>
            <Field label="栏目名称" value={section.title} onChange={value => update(current => ({ ...current, sections: current.sections.map(s => s.id === section.id ? { ...s, title: value } : s) }))}/>
            <Field label="栏目副标题" value={section.subtitle} onChange={value => update(current => ({ ...current, sections: current.sections.map(s => s.id === section.id ? { ...s, subtitle: value } : s) }))}/>
            <p className="section-dialog-hint">拖动预览里的「栏目」手柄可移动整个栏目。使用标题旁的 ＋ 添加组件。</p>
          </>
        ) : (
          component && (
            <ComponentFields
              item={component}
              toast={toast}
              onChange={(patch) =>
                update((current) => ({
                  ...current,
                  sections: current.sections.map((s) =>
                    s.id === section!.id
                      ? {
                          ...s,
                          components: s.components.map((c) =>
                            c.id === component.id ? { ...c, ...patch } : c,
                          ),
                        }
                      : s,
                  ),
                }))
              }
            />
          )
        )}
      </div>
      <div className="preview-dialog-footer">
        {component ? (
          <button
            className="text-button danger"
            onClick={() => {
              update((current) => ({
                ...current,
                sections: current.sections.map((s) =>
                  s.id === section!.id
                    ? {
                        ...s,
                        components: s.components.filter(
                          (c) => c.id !== component.id,
                        ),
                      }
                    : s,
                ),
              }));
              onClose();
            }}
          >
            <Trash2 size={15} />
            删除组件
          </button>
        ) : (
          <span>
            <Check size={14} />
            更改实时保存
          </span>
        )}
        <button className="primary-button" onClick={onClose}>
          <Check size={15} />
          完成编辑
        </button>
      </div>
    </Modal>
  );
}
