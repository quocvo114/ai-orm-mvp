import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { generateSuggestions } from "../../../lib/ai";

function buildFallbackSuggestions(review: {
  text?: string;
  rating?: number;
  author?: string;
}) {
  const rating = review.rating ?? 0;
  const author = review.author ?? "quý khách";
  const isNegative = rating <= 3;

  if (isNegative) {
    return {
      standard: `Chào ${author}, cảm ơn bạn đã phản hồi thẳng thắn. Chúng tôi thành thật xin lỗi vì trải nghiệm chưa tốt và sẽ rà soát ngay để cải thiện dịch vụ tốt hơn trong những lần tới.`,
      friendly: `Chào ${author}, cảm ơn bạn đã chia sẻ rất chi tiết. Team rất tiếc vì trải nghiệm của bạn chưa được như mong đợi và sẽ cố gắng khắc phục ngay.`,
      fix_issue: `Chúng tôi xin lỗi vì sự bất tiện này và sẽ kiểm tra lại toàn bộ quy trình liên quan để cải thiện dịch vụ.`,
    };
  }

  return {
    standard: `Cảm ơn ${author} đã tin tưởng và dành lời khen cho chúng tôi. Chúng tôi rất vui khi bạn hài lòng với trải nghiệm.`,
    friendly: `Cảm ơn ${author} rất nhiều! Phản hồi của bạn là động lực lớn cho team.`,
    fix_issue: `Cảm ơn bạn đã ủng hộ. Chúng tôi sẽ tiếp tục cải thiện để mang đến trải nghiệm tốt hơn nữa.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reviewId } = body;

    let review = null;

    // lấy review từ database
    if (reviewId) {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("id", reviewId)
        .single();

      if (error) {
        if (body.review) {
          review = body.review;
        } else {
          return NextResponse.json(
            { error: error.message || "DB error" },
            { status: 500 }
          );
        }
      } else {
        review = data;
      }
    } else {
      // lấy review trực tiếp từ body
      if (body.review && body.review.text) {
        review = body.review;
      } else if (body.text) {
        review = {
          text: body.text,
          rating: body.rating ?? 5,
          author: body.author ?? "unknown",
        };
      } else {
        return NextResponse.json(
          { error: "Missing review data" },
          { status: 400 }
        );
      }
    }

    let suggestions;
    try {
      suggestions = await generateSuggestions({ text: review.text, rating: review.rating, author: review.author });
    } catch (aiError) {
      console.error("AI generation error:", aiError);
      suggestions = buildFallbackSuggestions(review);
    }

    // lưu database nếu có reviewId
    if (reviewId) {
      try {
        await supabase
          .from("reviews")
          .update({ ai_suggestions: suggestions })
          .eq("id", reviewId);
      } catch (dbError) {
        console.error("DB update error:", dbError);
      }
    }

    return NextResponse.json({
      success: true,
      suggestions,
    });
  } catch (error) {
    console.error("API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}