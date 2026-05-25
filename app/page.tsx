"use client";

import { useMemo, useState } from "react";
import { Search, RefreshCw, Clipboard, Clock, CheckCircle, Star, RotateCw, Copy } from "lucide-react";

type ToneKey = "standard" | "friendly" | "fix_issue";

type Review = {
  id: number;
  author: string;
  rating: number;
  status: "Chờ xử lý" | "Đã giải quyết" | "Cần chú ý";
  date: string;
  source: string;
  text: string;
  response: Record<ToneKey, string>;
};
const initialReviews: Review[] = [
  {
    id: 1,
    author: "Nguyễn Văn A",
    rating: 4,
    status: "Chờ xử lý",
    date: "15/10/2023",
    source: "Google Maps",
    text:
      "Dịch vụ ở đây khá tốt, nhân viên nhiệt tình. Tuy nhiên thời gian chờ đợi hơi lâu một chút so với dự kiến. Hy vọng lần sau sẽ được cải thiện.",
    response: {
      standard:
        "Chào bạn Nguyễn Văn A, cảm ơn bạn đã dành thời gian đánh giá. Rất xin lỗi vì sự bất tiện do phải chờ đợi. Chúng tôi sẽ ghi nhận góp ý và cải thiện quy trình để phục vụ bạn tốt hơn trong lần tới!",
      friendly:
        "Chào anh A thân mến! Cảm ơn anh đã ghé thăm và gửi feedback chân tình. Chúng tôi rất xin lỗi vì hôm đó để anh chờ lâu hơn mong đợi. Lần tới anh quay lại, team sẽ cố gắng phục vụ nhanh và chu đáo hơn ạ!",
      fix_issue:
        "Kính chào quý khách, chúng tôi chân thành xin lỗi về trải nghiệm chờ đợi vừa qua. Đội ngũ quản lý đã rà soát lại quy trình và điều chỉnh nhân sự giờ cao điểm để tránh lặp lại tình trạng này. Rất mong quý khách cho chúng tôi cơ hội khắc phục.",
    },
  },
  {
    id: 2,
    author: "Lê Thị B",
    rating: 5,
    status: "Đã giải quyết",
    date: "14/10/2023",
    source: "Google Maps",
    text:
      "Thật tuyệt vời! Mình rất hài lòng với chất lượng dịch vụ và không gian quán. Sẽ quay lại nhiều lần nữa cùng gia đình.",
    response: {
      standard:
        "Cảm ơn chị B đã ủng hộ quán ạ! Chúng tôi rất vui khi biết chị hài lòng với dịch vụ và không gian. Rất mong sớm được đón tiếp chị và gia đình trong thời gian tới!",
      friendly:
        "Cảm ơn chị B rất nhiều! Nghe chị chia sẻ mà team vui cả ngày luôn ạ. Hy vọng lần tới ghé quán, chị vẫn sẽ có những trải nghiệm thật trọn vẹn cùng gia đình.",
      fix_issue:
        "Cảm ơn quý khách đã tin tưởng và ủng hộ. Chúng tôi sẽ tiếp tục duy trì chất lượng hiện tại và nâng cấp thêm trải nghiệm để mỗi lần quay lại đều tốt hơn lần trước.",
    },
  },
  {
    id: 3,
    author: "Trần Minh C",
    rating: 2,
    status: "Cần chú ý",
    date: "13/10/2023",
    source: "Google Maps",
    text:
      "Phòng hơi ồn, khu vực vệ sinh chưa sạch như kỳ vọng. Nhân viên phản hồi chậm khi mình cần hỗ trợ.",
    response: {
      standard:
        "Chào anh C, cảm ơn anh đã phản hồi thẳng thắn. Chúng tôi xin lỗi vì trải nghiệm chưa tốt và sẽ rà soát ngay các vấn đề về vệ sinh, tiếng ồn và tốc độ hỗ trợ để khắc phục triệt để.",
      friendly:
        "Chào anh C, cảm ơn anh đã góp ý rất cụ thể. Team rất tiếc vì trải nghiệm vừa rồi chưa được như kỳ vọng của anh. Chúng tôi sẽ ưu tiên xử lý những điểm anh nhắc đến để phục vụ tốt hơn ạ.",
      fix_issue:
        "Chúng tôi xin lỗi vì trải nghiệm chưa đạt yêu cầu. Bộ phận vận hành sẽ kiểm tra lại quy trình vệ sinh, cách âm phòng và thời gian phản hồi của nhân viên để cải thiện ngay trong các ca phục vụ tới.",
    },
  },
];

const stats = [
  { label: "Tổng review", value: "128", icon: "assessment", tone: "text-slate-900" },
  { label: "Chờ xử lý", value: "12", icon: "pending_actions", tone: "text-violet-700" },
  { label: "Đã giải quyết", value: "116", icon: "verified", tone: "text-emerald-600" },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index} className="text-[18px] leading-none">
          {index < rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  const [activeTone, setActiveTone] = useState<ToneKey>("standard");
  const [selectedReviewId, setSelectedReviewId] = useState(1);
  const [reviewsState, setReviewsState] = useState<Review[]>(initialReviews);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [placeId, setPlaceId] = useState<string>("");

  const selectedReview = useMemo(
    () => reviewsState.find((review) => review.id === selectedReviewId) ?? reviewsState[0],
    [selectedReviewId, reviewsState],
  );

  const toneLabels: Array<{ key: ToneKey; label: string }> = [
    { key: "standard", label: "Tiêu chuẩn" },
    { key: "friendly", label: "Thân thiện" },
    { key: "fix_issue", label: "Khắc phục" },
  ];


  const filterItems: Array<{ key: string; label: string }> = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xử lý" },
    { key: "attention", label: "Cần chú ý" },
  ];
  const [activeFilter, setActiveFilter] = useState<string>("pending");

  async function handleGenerate(id: number) {
    try {
      setGeneratingId(id);
      const review = reviewsState.find((r) => r.id === id);
      if (!review) return;

      const payload = { review: { text: review.text, rating: review.rating, author: review.author } };

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.suggestions) {
        setReviewsState((prev) =>
          prev.map((r) => (r.id === id ? { ...r, response: { ...r.response, ...data.suggestions } } : r)),
        );
      } else if (data.suggestions) {
        setReviewsState((prev) => prev.map((r) => (r.id === id ? { ...r, response: { ...r.response, ...data.suggestions } } : r)));
      }
    } catch (e) {
      console.error("Generate error", e);
    } finally {
      setGeneratingId(null);
    }
  }

  async function handleApprove(id: number) {
    try {
      setApprovingId(id);
      const res = await fetch(`/api/reviews/${id}/approve`, { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setReviewsState((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Đã giải quyết" } : r)));
      } else {
        console.error("Approve failed", data);
      }
    } catch (e) {
      console.error("Approve error", e);
    } finally {
      setApprovingId(null);
    }
  }

  async function handleFetchPlace() {
    if (!placeId) return;
    try {
      const res = await fetch("/api/fetch-place", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ placeId }),
      });
      const data = await res.json();
      if (res.ok && data.reviews) {
        const mapped = data.reviews.map((r: any, i: number) => ({
          id: Date.now() + i,
          author: r.author_name ?? "Unknown",
          rating: r.rating ?? 5,
          status: "Chờ xử lý",
          date: new Date((r.time ?? Date.now() / 1000) * 1000).toLocaleDateString(),
          source: "Google Maps",
          text: r.text ?? "",
          response: { standard: "", friendly: "", fix_issue: "" },
        }));
        setReviewsState((prev) => [...mapped, ...prev]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-900">
      {/* Sidebar removed for full-width layout */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
        <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                Quản lý Google Maps
              </h1>
              <p className="mt-1 text-xs text-slate-500">Tổng quan review, phản hồi AI và trạng thái xử lý</p>
            </div>
          </div>

          <div className="flex flex-1 items-center gap-3 lg:max-w-2xl lg:justify-end">
            <div className="relative w-full lg:max-w-xl">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Search className="h-4 w-4" /></span>
              <input
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                placeholder="Tìm kiếm review..."
                type="text"
              />
            </div>

            <button className="inline-flex w-[275px] items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 active:scale-[0.98]">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Đồng bộ Place ID</span>
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-8 px-4 py-6 pb-16 lg:px-10 lg:py-8">
        <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#6b38d4] via-[#3d6ac5] to-[#0090a9] px-4 py-6 text-white shadow-sm sm:px-6 sm:py-8">
          <div className="relative z-10 max-w-4xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Google Maps Sync</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-4xl">
              Đồng bộ đánh giá và tạo phản hồi AI trong một luồng
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/85 sm:text-base">
              Nhập Google Place ID để hệ thống tự động thu thập review, phân loại mức độ ưu tiên và gợi ý câu trả lời phù hợp.
            </p>

            <div className="mt-8 flex flex-col gap-3 lg:flex-row">
              <input
                value={placeId}
                onChange={(e) => setPlaceId(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/60 outline-none ring-0 backdrop-blur focus:border-white/40 focus:bg-white/20"
                placeholder="Nhập Google Place ID"
                type="text"
              />
              <button onClick={handleFetchPlace} className="rounded-2xl w-[250px] bg-white px-6 py-4 text-sm font-bold text-violet-700 transition hover:bg-white/95 active:scale-[0.99]">
                Lấy đánh giá
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-32 h-64 w-64 rounded-full bg-cyan-200/10 blur-3xl" />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
            <article
              key={stat.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className={`mt-2 text-3xl font-bold tracking-tight ${stat.tone}`}>{stat.value}</p>
                </div>
                <div className={`grid h-12 w-12 place-items-center rounded-lg bg-slate-50 text-xl ${stat.tone}`}>
                  {stat.icon === "assessment" ? <Clipboard className="h-5 w-5" /> : stat.icon === "pending_actions" ? <Clock className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />}
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Quản lý đánh giá mới nhất</h2>
            <div className="flex flex-row flex-nowrap gap-2 items-center">
              {filterItems.map((item) => {
                const count = reviewsState.filter((r) => {
                  if (item.key === "all") return true;
                  if (item.key === "pending") return r.status === "Chờ xử lý";
                  if (item.key === "attention") return r.status === "Cần chú ý";
                  return true;
                }).length;

                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveFilter(item.key)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition whitespace-nowrap flex items-center gap-3 ${
                      activeFilter === item.key
                        ? "bg-violet-700 text-white shadow-sm"
                        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-full bg-white/20 px-2 text-xs font-medium">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

            <div className="grid gap-6 xl:grid-cols-2">
            {(() => {
              const filtered = reviewsState.filter((review) => {
                if (activeFilter === "all") return true;
                if (activeFilter === "pending") return review.status === "Chờ xử lý";
                if (activeFilter === "attention") return review.status === "Cần chú ý";
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="col-span-2 rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-600">
                    Không tìm thấy đánh giá phù hợp.
                  </div>
                );
              }

              return filtered.map((review) => {
                const isSelected = review.id === selectedReviewId;
                return (
                  <article
                    key={review.id}
                    className={`overflow-hidden rounded-[1.75rem] border bg-white shadow-sm transition ${
                      isSelected ? "border-violet-300 ring-2 ring-violet-100" : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                      <button
                        onClick={() => setSelectedReviewId(review.id)}
                        className="flex w-full items-start gap-4 text-left"
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-lg font-bold text-slate-700">
                          {review.author
                            .split(" ")
                            .slice(-1)[0]
                            .slice(0, 1)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900">{review.author}</h3>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {review.source}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center gap-3">
                            <StarRating rating={review.rating} />
                            <span className="text-sm text-slate-500">{review.status}</span>
                          </div>
                        </div>
                      </button>
                      <span
                        className={`inline-flex w-fit items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold ${
                          review.status === "Đã giải quyết"
                            ? "bg-emerald-100 text-emerald-700"
                            : review.status === "Cần chú ý"
                              ? "bg-rose-100 text-rose-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {review.status}
                      </span>
                    </div>

                    <div className="space-y-5 p-5 sm:p-6">
                      <p className="text-sm leading-7 text-slate-600">{review.text}</p>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Đăng ngày: {review.date}
                      </p>

                      <div className="rounded-3xl border border-violet-200 bg-violet-50/60 p-5 sm:p-6">
                        <div className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-violet-700">
                          <span className="grid h-8 w-8 place-items-center rounded-lg bg-violet-600 text-white"><Star className="h-4 w-4" /></span>
                          AI Phản hồi gợi ý
                        </div>

                        <div className="mb-4 grid gap-2 sm:grid-cols-3">
                          {toneLabels.map((tone) => (
                            <button
                              key={tone.key}
                              onClick={() => setActiveTone(tone.key)}
                              className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                                activeTone === tone.key && isSelected
                                  ? "bg-violet-700 text-white"
                                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {tone.label}
                            </button>
                          ))}
                        </div>

                        <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                          <textarea
                            readOnly
                            className="min-h-24 w-full resize-none bg-transparent text-sm leading-6 text-slate-700 outline-none"
                            value={review.response[activeTone]}
                          />
                          <div className="mt-3 flex justify-end gap-2 text-slate-400">
                            <button className="rounded-lg p-2 transition hover:bg-slate-100 hover:text-violet-700">
                              <RotateCw className="h-4 w-4" />
                            </button>
                            <button className="rounded-lg p-2 transition hover:bg-slate-100 hover:text-violet-700">
                              <Copy className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                          <button className="rounded-xl border border-violet-300 px-5 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50">
                            Sửa bản thảo
                          </button>
                          <button
                            onClick={() => handleGenerate(review.id)}
                            disabled={generatingId === review.id}
                            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            {generatingId === review.id ? "Đang tạo..." : "Tạo AI"}
                          </button>
                          <button
                            onClick={() => handleApprove(review.id)}
                            disabled={approvingId === review.id}
                            className="rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-violet-800"
                          >
                            {approvingId === review.id ? "Đang duyệt..." : "Duyệt và gửi phản hồi"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              });
            })()}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Bản thảo đang chọn</h3>
                <p className="mt-1 text-sm text-slate-500">{selectedReview.author} · {selectedReview.source}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 whitespace-nowrap">
                {selectedReview.status}
              </span>
            </div>

            <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm leading-7 text-slate-700">{selectedReview.response[activeTone]}</p>
            </div>
          </article>

          <article className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Luồng xử lý nhanh</h3>
            <div className="mt-5 space-y-4">
              {[
                ["1", "Đồng bộ review từ Google Maps"],
                ["2", "Phân loại review theo mức độ ưu tiên"],
                ["3", "Tạo phản hồi AI theo giọng điệu"],
                ["4", "Duyệt và gửi phản hồi"],
              ].map(([step, label]) => (
                <div key={step} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-700 text-sm font-bold text-white">
                    {step}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{label}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
