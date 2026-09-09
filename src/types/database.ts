/**
 * Supabase 테이블 타입.
 *
 * supabase/schema.sql 과 짝을 이룬다. 스키마를 바꾸면 여기도 함께 고쳐야 한다.
 * (supabase gen types 로 자동 생성할 수도 있지만, 테이블이 넷뿐이라 손으로 관리한다)
 */

export type BookingStatus = "pending" | "paid" | "cancelled" | "completed";

export type BookingRow = {
  id: string;
  created_at: string;
  updated_at: string;
  plan_id: string;
  event_date: string;
  event_time: string;
  guest_count: number;
  extra_butlers: number;
  groom_name: string;
  bride_name: string;
  venue_name: string;
  venue_address: string | null;
  contact_name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  total_amount: number;
  deposit_amount: number;
  status: BookingStatus;
  payment_id: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
};

export type BookingInsert = Omit<
  BookingRow,
  | "id"
  | "created_at"
  | "updated_at"
  | "paid_at"
  | "cancelled_at"
  | "cancel_reason"
> & {
  id?: string;
  paid_at?: string | null;
  cancelled_at?: string | null;
  cancel_reason?: string | null;
};

export type PaymentRow = {
  id: string;
  created_at: string;
  booking_id: string | null;
  portone_payment_id: string;
  amount: number;
  status: string;
  method: string | null;
  raw: unknown;
};

export type PaymentInsert = Omit<PaymentRow, "id" | "created_at">;

export type QnaPostRow = {
  id: number;
  created_at: string;
  updated_at: string;
  title: string;
  content: string;
  author_name: string;
  password_hash: string;
  is_secret: boolean;
  is_answered: boolean;
  view_count: number;
};

export type QnaPostInsert = Omit<
  QnaPostRow,
  "id" | "created_at" | "updated_at" | "is_answered" | "view_count"
>;

export type QnaAnswerRow = {
  id: number;
  created_at: string;
  updated_at: string;
  post_id: number;
  content: string;
};

export type QnaAnswerInsert = Omit<
  QnaAnswerRow,
  "id" | "created_at" | "updated_at"
>;

type TableShape<Row, Insert> = {
  Row: Row;
  Insert: Insert;
  // Update 는 Insert 가 아니라 Row 기준이다. is_answered 처럼 삽입 시에는
  // 기본값에 맡기지만 나중에 갱신하는 컬럼이 있기 때문이다.
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      bookings: TableShape<BookingRow, BookingInsert>;
      payments: TableShape<PaymentRow, PaymentInsert>;
      qna_posts: TableShape<QnaPostRow, QnaPostInsert>;
      qna_answers: TableShape<QnaAnswerRow, QnaAnswerInsert>;
    };
    Views: Record<never, never>;
    Functions: {
      increment_qna_view: {
        Args: { target_id: number };
        Returns: undefined;
      };
    };
    Enums: {
      booking_status: BookingStatus;
    };
    CompositeTypes: Record<never, never>;
  };
};
