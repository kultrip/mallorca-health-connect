import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";
import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

type ProfessionalReview = {
  id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export function ProfessionalReviewsSection({
  therapistId,
  therapistName,
  isVisible,
}: {
  therapistId: string;
  therapistName: string;
  isVisible: boolean;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data: reviews = [], refetch } = useQuery<ProfessionalReview[]>({
    queryKey: ["professional-reviews", therapistId],
    enabled: isVisible,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("professional_reviews")
        .select("id, reviewer_name, rating, comment, created_at")
        .eq("therapist_id", therapistId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as ProfessionalReview[];
    },
  });

  const hasReviews = reviews.length > 0;
  const ratingOptions = useMemo(() => [1, 2, 3, 4, 5], []);

  if (!isVisible) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reviewerName.trim()) {
      toast.error("Por favor, indica tu nombre.");
      return;
    }
    if (!rating) {
      toast.error("Selecciona una valoración del 1 al 5.");
      return;
    }

    setSaving(true);
    const { error } = await supabase.from("professional_reviews").insert({
      therapist_id: therapistId,
      reviewer_name: reviewerName.trim(),
      reviewer_email: reviewerEmail.trim() || null,
      rating,
      comment: comment.trim() || null,
    });
    setSaving(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setReviewerName("");
    setReviewerEmail("");
    setRating(0);
    setComment("");
    setIsFormOpen(false);
    setSuccessMessage("Gracias. Tu opinión será revisada antes de publicarse.");
    toast.success("Gracias. Tu opinión será revisada antes de publicarse.");
    await refetch();
  };

  return (
    <section className="mt-10 rounded-3xl border border-[#eadfce] bg-[#fffaf4] p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#6d5b43]">Opiniones</p>
          <h2 className="font-display text-3xl text-[#1f3326]">Qué dicen las personas</h2>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-[#9d8d76] bg-white/60 text-[#342b22] hover:bg-white"
          onClick={() => setIsFormOpen((current) => !current)}
        >
          {isFormOpen ? "Cerrar formulario" : "Dejar una opinión"}
        </Button>
      </div>

      {successMessage && (
        <div className="mt-4 rounded-2xl border border-[#d8c6b0] bg-white px-4 py-3 text-sm text-[#5d5144]">
          {successMessage}
        </div>
      )}

      {hasReviews ? (
        <div className="mt-6 space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-2xl border border-[#eadfce] bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium text-[#1f3326]">{firstName(review.reviewer_name)}</h3>
                  <p className="mt-1 text-xs text-[#6d5b43]">
                    {new Date(review.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <div
                  className="flex items-center gap-1"
                  aria-label={`${review.rating} de 5 estrellas`}
                >
                  {ratingOptions.map((value) => (
                    <Star
                      key={value}
                      className={`h-4 w-4 ${value <= review.rating ? "fill-[#9a7041] text-[#9a7041]" : "text-[#d8c6b0]"}`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#342b22]">
                  {review.comment}
                </p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-sm leading-7 text-[#5d5144]">
          Aún no hay opiniones. Sé el primero en compartir tu experiencia.
        </p>
      )}

      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5 rounded-2xl border border-[#eadfce] bg-white p-5"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`review-name-${therapistId}`}>Nombre</Label>
              <Input
                id={`review-name-${therapistId}`}
                value={reviewerName}
                onChange={(event) => setReviewerName(event.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`review-email-${therapistId}`}>Correo electrónico (opcional)</Label>
              <Input
                id={`review-email-${therapistId}`}
                type="email"
                value={reviewerEmail}
                onChange={(event) => setReviewerEmail(event.target.value)}
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Valoración</Label>
            <div className="flex flex-wrap gap-2">
              {ratingOptions.map((value) => {
                const active = value <= rating;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm transition-colors ${
                      active
                        ? "border-[#9a7041] bg-[#f8efe4] text-[#7a5730]"
                        : "border-[#eadfce] bg-white text-[#5d5144] hover:bg-[#fffaf4]"
                    }`}
                  >
                    <Star className={`h-4 w-4 ${active ? "fill-current" : ""}`} />
                    {value}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`review-comment-${therapistId}`}>Comentario</Label>
            <Textarea
              id={`review-comment-${therapistId}`}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder={`Cuéntanos cómo te has sentido con ${therapistName}.`}
              className="min-h-32"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsFormOpen(false)}
              className="text-[#5d5144]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#526046] text-white hover:bg-[#435039]"
            >
              {saving ? "Enviando..." : "Enviar opinión"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}
