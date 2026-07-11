import { useState } from "react";
import { CheckCircle2, CreditCard, Info, Save } from "lucide-react";
import { useParams } from "react-router-dom";

import { PageLayout } from "@/components/Utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { mockEvents } from "@/data/events";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const PaymentPage = () => {
  const { eventId, subeventId } = useParams();
  const event = mockEvents.find((item) => item.id === eventId);
  const subevent = event?.subevents.find((item) => item.id === subeventId);
  const [isPaid, setIsPaid] = useState(subevent?.paid ?? false);
  const [price, setPrice] = useState(subevent?.price ?? 0);
  const [accountName, setAccountName] = useState(subevent?.paymentAccountName ?? "");
  const [accountNumber, setAccountNumber] = useState(subevent?.paymentAccountNumber?.toString() ?? "");
  const [bank, setBank] = useState(subevent?.paymentAccountBank ?? "");
  const [modifier, setModifier] = useState(subevent?.priceModifier ?? 1);
  const [instructions, setInstructions] = useState(subevent?.paymentDesc ?? "");
  const [isSaved, setIsSaved] = useState(false);
  const transferAmount = price + modifier;

  return (
    <PageLayout
      icon={CreditCard}
      title="Payment settings"
      breadcrumbs={["Tools", "Events", event?.name ?? "Event", subevent?.name ?? "Sub-event", "Payment settings"]}
    >
      {subevent ? (
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6 overflow-hidden rounded-xl border border-primary/20 bg-primary text-primary-foreground shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-bold tracking-[0.1em] text-primary-foreground/75">PAYMENT SETTINGS</p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{subevent.name}</h2>
                <p className="mt-1 text-sm leading-6 text-primary-foreground/80">Set the exact transfer details participants will use.</p>
              </div>
              <Badge variant="secondary" className="bg-white/15 text-white hover:bg-white/15">{isPaid ? "Paid" : "Free"}</Badge>
            </div>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border bg-muted/35"><CardTitle className="text-base">Payment collection</CardTitle></CardHeader>
            <CardContent className="space-y-6 p-5 sm:p-6">
              <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border bg-muted/30 px-4 py-3.5">
                <span><span className="block text-sm font-semibold text-foreground">Payment required</span><span className="mt-0.5 block text-xs leading-5 text-muted-foreground">Turn this on when participants must transfer money to join.</span></span>
                <input aria-label="Payment required" className="h-5 w-5 rounded border-input text-primary focus:ring-ring" type="checkbox" checked={isPaid} onChange={(event) => { setIsPaid(event.target.checked); setIsSaved(false); }} />
              </label>

              <div className={isPaid ? "space-y-6" : "pointer-events-none space-y-6 opacity-50"} aria-disabled={!isPaid}>
                <section className="grid gap-5 border-b border-border pb-6 sm:grid-cols-2">
                  <div className="space-y-2"><label className="text-sm font-semibold text-foreground" htmlFor="payment-price">Base price</label><Input id="payment-price" type="number" min="0" step="1" disabled={!isPaid} value={price} onChange={(event) => { setPrice(Number(event.target.value) || 0); setIsSaved(false); }} /><p className="text-xs text-muted-foreground">The advertised sub-event price before the reconciliation modifier.</p></div>
                  <div className="space-y-2"><label className="text-sm font-semibold text-foreground" htmlFor="payment-modifier">Bank reconciliation modifier</label><Input id="payment-modifier" type="number" min="0" step="1" disabled={!isPaid} value={modifier} onChange={(event) => { setModifier(Number(event.target.value) || 0); setIsSaved(false); }} /><p className="text-xs text-muted-foreground">Add a small amount, usually Rp1, to make manual bank-statement checks easier.</p></div>
                </section>

                <section className="rounded-xl border border-semantic-info-border bg-semantic-info-background p-4 text-semantic-info">
                  <p className="text-xs font-bold tracking-[0.08em]">PARTICIPANT TRANSFER AMOUNT</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">{formatCurrency(transferAmount)}</p>
                  <p className="mt-1 text-sm leading-6">{formatCurrency(price)} base price + {formatCurrency(modifier)} modifier. This exact amount is easier to find in a bank statement.</p>
                </section>

                <section className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2"><label className="text-sm font-semibold text-foreground" htmlFor="payment-account-name">Account holder name</label><Input id="payment-account-name" disabled={!isPaid} value={accountName} placeholder="e.g. KOMTIG HIMTI" onChange={(event) => { setAccountName(event.target.value); setIsSaved(false); }} /></div>
                  <div className="space-y-2"><label className="text-sm font-semibold text-foreground" htmlFor="payment-account-number">Account number</label><Input id="payment-account-number" disabled={!isPaid} inputMode="numeric" value={accountNumber} placeholder="e.g. 1234567890" onChange={(event) => { setAccountNumber(event.target.value); setIsSaved(false); }} /></div>
                  <div className="space-y-2"><label className="text-sm font-semibold text-foreground" htmlFor="payment-bank">Bank</label><Input id="payment-bank" disabled={!isPaid} value={bank} placeholder="e.g. BCA" onChange={(event) => { setBank(event.target.value); setIsSaved(false); }} /></div>
                  <div className="space-y-2 sm:col-span-2"><label className="text-sm font-semibold text-foreground" htmlFor="payment-instructions">Transfer instructions <span className="font-normal text-muted-foreground">(optional)</span></label><textarea id="payment-instructions" disabled={!isPaid} rows={4} className="flex w-full resize-y rounded-lg border border-input bg-card px-3 py-2 text-sm leading-6 text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60" value={instructions} placeholder="Tell participants what to include with their transfer." onChange={(event) => { setInstructions(event.target.value); setIsSaved(false); }} /></div>
                </section>
              </div>

              {!isPaid && <p className="flex items-start gap-2 rounded-lg border border-semantic-info-border bg-semantic-info-background px-3 py-2.5 text-sm leading-5 text-semantic-info"><Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />Participants will not see payment instructions while this sub-event is free.</p>}

              <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5"><Button type="button" onClick={() => setIsSaved(true)}><Save /> Save payment settings</Button></div>
              {isSaved && <p role="status" className="flex items-center gap-2 rounded-lg border border-semantic-success-border bg-semantic-success-background px-3 py-2.5 text-sm text-semantic-success"><CheckCircle2 aria-hidden="true" className="h-4 w-4" /> Payment settings saved locally</p>}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </PageLayout>
  );
};

export default PaymentPage;
