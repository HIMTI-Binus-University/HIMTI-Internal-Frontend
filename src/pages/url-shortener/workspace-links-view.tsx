import { useEffect, useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Copy,
  Link2,
  Paperclip,
  Pencil,
  Plus,
  QrCode,
  UserRound,
} from "lucide-react";

import {
  useArchiveWorkspace,
  useAttachWorkspaceLink,
  useCreateWorkspaceLink,
  useDeactivateWorkspaceLink,
  useLinkWorkspace,
  useUpdateWorkspaceLink,
  useUpdateWorkspace,
  useWorkspaceLinks,
} from "@/api/link-workspaces/queries";
import { useGetMe } from "@/api/auth/queries";
import { useGetUrlList } from "@/api/url-shortener/queries";
import {
  Container,
  EmptyState,
  PageLayout,
  PaginationFooter,
  SearchField,
} from "@/components/Utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { shortLinkConfig } from "@/config/runtime";
import {
  canEditWorkspaceLinks,
  canManageWorkspace,
  getWorkspaceRole,
  type WorkspaceLink,
  type WorkspaceLinkInput,
} from "@/types/link-workspace";
import { formatUrlCreatedAt } from "@/utils/url-shortener";
import { QRCodeDialog } from ".";
import { WorkspaceMembers } from "./workspace-members";

const PAGE_SIZE = 10;

const normalizeUrl = (value: string) => {
  const candidate = /^https?:\/\//i.test(value.trim())
    ? value.trim()
    : `https://${value.trim()}`;
  try {
    const url = new URL(candidate);
    url.hostname = url.hostname.replace(/^www\./i, "");
    return url.toString();
  } catch {
    return candidate;
  }
};

export function WorkspaceLinksView({
  workspaceId,
  workspaceSwitcher,
}: {
  workspaceId: string;
  workspaceSwitcher: ReactNode;
}) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [editing, setEditing] = useState<WorkspaceLink | null>(null);
  const [deactivating, setDeactivating] = useState<WorkspaceLink | null>(null);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [workspaceFormOpen, setWorkspaceFormOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(search.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
    setSearch("");
    setEditing(null);
  }, [workspaceId]);

  const workspace = useLinkWorkspace(workspaceId);
  const links = useWorkspaceLinks(workspaceId);
  const me = useGetMe();
  const deactivate = useDeactivateWorkspaceLink(workspaceId);
  const archive = useArchiveWorkspace(workspaceId);
  const current = workspace.data;
  const isAdmin = me.data?.roles.includes("Admin") ?? false;
  const role = current ? getWorkspaceRole(current, me.data?.id) : undefined;
  const canManage = canManageWorkspace(role, isAdmin);
  const canEditLinks = canEditWorkspaceLinks(role, isAdmin);
  const filteredLinks = (links.data ?? []).filter((link) => {
    const query = debouncedSearch.toLowerCase();
    return (
      !query ||
      link.url.shortCode.toLowerCase().includes(query) ||
      link.url.originalUrl.toLowerCase().includes(query)
    );
  });
  const totalPages = Math.max(1, Math.ceil(filteredLinks.length / PAGE_SIZE));
  const visibleLinks = filteredLinks.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <PageLayout
      icon={Link2}
      title={current?.name ?? "Link workspace"}
      actions={
        <div className="flex items-center gap-2">{workspaceSwitcher}</div>
      }
    >
      {workspace.isError ? (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-semantic-danger-border bg-semantic-danger-background p-4 text-sm text-semantic-danger"
        >
          <AlertCircle className="h-4 w-4 shrink-0" /> This workspace could not
          be loaded.
        </div>
      ) : !current ? (
        <p className="text-sm text-muted-foreground">Loading workspace...</p>
      ) : (
        <div className="grid min-w-0 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-6">
            <section className="relative overflow-hidden rounded-xl border border-brand-secondary-2 bg-card p-5 shadow-sm">
              <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-blue-50 to-transparent" />
              <div className="relative flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <BriefcaseBusiness className="h-5 w-5 text-primary" />
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                      {isAdmin && !role ? "ADMIN" : (role ?? "MEMBER")}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold">{current.name}</h2>
                  <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                    {current.description ||
                      "A shared home for your team's short links."}
                  </p>
                </div>
                <div className="flex gap-2">
                  {canEditLinks && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAttachOpen(true)}
                    >
                      <Paperclip /> Attach personal
                    </Button>
                  )}
                  {canEditLinks && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setEditing(null);
                        setFormOpen(true);
                      }}
                    >
                      <Plus /> Create link
                    </Button>
                  )}
                </div>
              </div>
            </section>

            <Container>
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-semibold">
                    Shared links ({links.data?.length ?? 0})
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Everyone in this workspace can access these links.
                  </p>
                </div>
                {canManage && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setWorkspaceFormOpen(true)}
                    >
                      Edit workspace
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setArchiveOpen(true)}
                    >
                      Archive
                    </Button>
                  </div>
                )}
              </div>
              <SearchField
                id="workspace-link-search"
                label="Search workspace links"
                placeholder="Search by short code or target URL..."
                value={search}
                onChange={(value) => {
                  setSearch(value);
                  setPage(1);
                }}
              />
              {links.isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading links...
                </p>
              ) : links.isError ? (
                <p role="alert" className="text-sm text-semantic-danger">
                  Links could not be loaded.
                </p>
              ) : !visibleLinks.length ? (
                <EmptyState
                  icon={Link2}
                  title={
                    debouncedSearch
                      ? "No links match your search"
                      : "No shared links yet"
                  }
                  description={
                    debouncedSearch
                      ? "Try another short code or target URL."
                      : "Create a link or attach one you own."
                  }
                />
              ) : (
                <div>
                  {visibleLinks.map((link) => (
                    <article
                      key={link.id}
                      className="-mx-5 flex items-start justify-between gap-3 border-t border-border px-5 py-4 first:border-t-0 max-sm:flex-col"
                    >
                      <div className="min-w-0 flex-1 space-y-2">
                        <p className="break-all font-semibold">
                          {shortLinkConfig.buildShortUrl(link.url.shortCode)}
                        </p>
                        <p className="flex min-w-0 items-center gap-2 break-all text-sm text-muted-foreground">
                          <ArrowRight className="h-4 w-4 shrink-0" />{" "}
                          {link.url.originalUrl}
                        </p>
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-4 w-4" />{" "}
                            {formatUrlCreatedAt(link.createdAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <UserRound className="h-4 w-4" />{" "}
                            {link.creator?.name ?? "Unknown"}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <IconButton
                          label={
                            copiedId === link.id
                              ? "Link copied"
                              : "Copy short link"
                          }
                          tone="primary"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              shortLinkConfig.buildShortUrl(link.url.shortCode),
                            );
                            setCopiedId(link.id);
                            window.setTimeout(() => setCopiedId(null), 1500);
                          }}
                        >
                          {copiedId === link.id ? <Check /> : <Copy />}
                        </IconButton>
                        <IconButton
                          label="Generate QR code"
                          tone="primary"
                          onClick={() =>
                            setQrUrl(
                              shortLinkConfig.buildShortUrl(link.url.shortCode),
                            )
                          }
                        >
                          <QrCode />
                        </IconButton>
                        {canEditLinks && (
                          <IconButton
                            label="Edit link"
                            tone="primary"
                            onClick={() => {
                              setEditing(link);
                              setFormOpen(true);
                            }}
                          >
                            <Pencil />
                          </IconButton>
                        )}
                        {canEditLinks && (
                          <IconButton
                            label="Deactivate link"
                            tone="danger"
                            onClick={() => setDeactivating(link)}
                          >
                            <Link2 />
                          </IconButton>
                        )}
                      </div>
                    </article>
                  ))}
                  {totalPages > 1 && (
                    <PaginationFooter
                      label={`Page ${page} of ${totalPages}`}
                      page={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  )}
                </div>
              )}
            </Container>
          </div>
          <WorkspaceMembers
            workspace={current}
            canManage={canManage}
            currentUserId={me.data?.id}
            canSearchUsers={
              me.data?.permissions.includes("manage_users") ?? false
            }
          />
        </div>
      )}

      {current && (
        <LinkFormDialog
          workspaceId={workspaceId}
          open={formOpen}
          link={editing}
          onClose={() => {
            setFormOpen(false);
            setEditing(null);
          }}
        />
      )}
      {current && canManage && (
        <WorkspaceFormDialog
          workspace={current}
          open={workspaceFormOpen}
          onClose={() => setWorkspaceFormOpen(false)}
        />
      )}
      {canEditLinks && (
        <AttachLinkDialog
          workspaceId={workspaceId}
          open={attachOpen}
          onClose={() => setAttachOpen(false)}
        />
      )}
      <QRCodeDialog url={qrUrl} onClose={() => setQrUrl(null)} />
      <AlertDialog open={archiveOpen} onOpenChange={setArchiveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Archived workspaces cannot be edited and will leave the active
              workspace list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={archive.isPending}
              onClick={() =>
                archive.mutate(undefined, {
                  onSuccess: () => setArchiveOpen(false),
                })
              }
            >
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!deactivating}
        onOpenChange={(open) => !open && setDeactivating(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate shared link?</AlertDialogTitle>
            <AlertDialogDescription>
              The short URL will stop redirecting. This action cannot be
              reversed here.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="delete"
              onClick={() =>
                deactivating &&
                deactivate.mutate(deactivating.id, {
                  onSuccess: () => setDeactivating(null),
                })
              }
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}

function WorkspaceFormDialog({
  workspace,
  open,
  onClose,
}: {
  workspace: { id: string; name: string; description: string | null };
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description ?? "");
  const update = useUpdateWorkspace(workspace.id);

  useEffect(() => {
    if (open) {
      setName(workspace.name);
      setDescription(workspace.description ?? "");
    }
  }, [open, workspace.description, workspace.name]);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit workspace</DialogTitle>
          <DialogDescription>
            Update the shared workspace details.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            update.mutate(
              { name: name.trim(), description: description.trim() || null },
              { onSuccess: onClose },
            );
          }}
        >
          <div>
            <Label htmlFor="edit-workspace-name" className="mb-2">
              Name
            </Label>
            <Input
              id="edit-workspace-name"
              required
              maxLength={255}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="edit-workspace-description" className="mb-2">
              Description
            </Label>
            <Input
              id="edit-workspace-description"
              maxLength={5000}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          {update.isError && (
            <p role="alert" className="text-sm text-semantic-danger">
              The workspace could not be updated.
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || update.isPending}>
              {update.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LinkFormDialog({
  workspaceId,
  open,
  link,
  onClose,
}: {
  workspaceId: string;
  open: boolean;
  link: WorkspaceLink | null;
  onClose: () => void;
}) {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortCode, setShortCode] = useState("");
  const create = useCreateWorkspaceLink(workspaceId);
  const update = useUpdateWorkspaceLink(workspaceId);
  const mutation = link ? update : create;

  useEffect(() => {
    if (open) {
      setOriginalUrl(link?.url.originalUrl ?? "");
      setShortCode(
        shortLinkConfig.toEditableShortCode(link?.url.shortCode ?? ""),
      );
    }
  }, [link, open]);

  const submit = () => {
    const payload: WorkspaceLinkInput = {
      originalUrl: normalizeUrl(originalUrl),
      shortCode: shortLinkConfig.toEditableShortCode(shortCode),
    };
    if (link)
      update.mutate({ id: link.id, ...payload }, { onSuccess: onClose });
    else create.mutate(payload, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {link ? "Edit shared link" : "Create shared link"}
          </DialogTitle>
          <DialogDescription>
            This link is available to everyone in the workspace.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <div>
            <Label htmlFor="shared-target" className="mb-2">
              Target link
            </Label>
            <Input
              id="shared-target"
              required
              value={originalUrl}
              onChange={(event) => setOriginalUrl(event.target.value)}
              placeholder="https://himti.or.id"
            />
          </div>
          <div>
            <Label htmlFor="shared-code" className="mb-2">
              Short link
            </Label>
            <div className="mt-1 flex overflow-hidden rounded-lg border border-input">
              <span className="flex min-w-0 max-w-full shrink items-center truncate bg-muted px-3 text-sm font-semibold text-muted-foreground max-md:hidden">
                {shortLinkConfig.displayPrefix}
              </span>
              <Input
                id="shared-code"
                required
                value={shortCode}
                onChange={(event) =>
                  setShortCode(
                    link
                      ? shortLinkConfig.toEditableShortCode(event.target.value)
                      : event.target.value,
                  )
                }
                className="flex-1 rounded-none border-0 focus-visible:ring-0"
                minLength={3}
                maxLength={100}
                pattern="[a-zA-Z0-9]+"
                title="Use only letters and numbers"
                placeholder="event2026"
              />
            </div>
          </div>
          {mutation.isError && (
            <p role="alert" className="text-sm text-semantic-danger">
              The link could not be saved. Check that the short code is
              available.
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !originalUrl.trim() || !shortCode.trim() || mutation.isPending
              }
            >
              {mutation.isPending ? "Saving..." : "Save link"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AttachLinkDialog({
  workspaceId,
  open,
  onClose,
}: {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
}) {
  const personalLinks = useGetUrlList({ page: 1, limit: 100 });
  const attach = useAttachWorkspaceLink(workspaceId);
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>Attach a personal link</DialogTitle>
          <DialogDescription>
            Only links you own are eligible. Attaching makes the link shared
            with this workspace.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-80 divide-y divide-border overflow-y-auto rounded-lg border border-border">
          {personalLinks.isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">
              Loading your links...
            </p>
          ) : personalLinks.data?.data.length ? (
            personalLinks.data.data.map((link) => (
              <div key={link.id} className="flex items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {shortLinkConfig.buildShortUrl(link.shortCode)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {link.originalUrl}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={attach.isPending}
                  onClick={() => attach.mutate(link.id, { onSuccess: onClose })}
                >
                  Attach
                </Button>
              </div>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">
              No active personal links are available.
            </p>
          )}
        </div>
        {attach.isError && (
          <p role="alert" className="text-sm text-semantic-danger">
            This link could not be attached. It may already belong to a
            workspace.
          </p>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
