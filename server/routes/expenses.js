import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { getSupabaseClient } from "../config/db.js";

const router = express.Router();

const createExpenseSchema = z.object({
  groupId: z.string().min(1),
  payerMemberId: z.string().min(1),
  amount: z.number().int().positive(),
  description: z.string().min(1),
  splitAmongMemberIds: z.array(z.string().min(1)).min(1),
});

const formatExpense = (expense) => ({
  _id: expense.id,
  groupId: expense.group_id,
  payerMemberId: expense.payer_member_id,
  amount: expense.amount,
  description: expense.description,
  splitAmongMemberIds: expense.split_among_member_ids || [],
  createdAt: expense.created_at,
});

router.get("/", async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { groupId } = req.query;
    let query = supabase
      .from("expenses")
      .select("id, group_id, payer_member_id, amount, description, split_among_member_ids, created_at")
      .order("created_at", { ascending: false });

    if (groupId) {
      query = query.eq("group_id", groupId);
    }

    const { data, error } = await query;
    if (error) {
      error.statusCode = 500;
      throw error;
    }

    res.json((data || []).map(formatExpense));
  } catch (error) {
    next(error);
  }
});

router.post("/", validate(createExpenseSchema), async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { groupId, payerMemberId, amount, description, splitAmongMemberIds } =
      req.body;

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id")
      .eq("id", groupId)
      .maybeSingle();

    if (groupError) {
      groupError.statusCode = 500;
      throw groupError;
    }

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const { data: expense, error } = await supabase
      .from("expenses")
      .insert({
        group_id: groupId,
        payer_member_id: payerMemberId,
        amount,
        description,
        split_among_member_ids: splitAmongMemberIds,
      })
      .select("id, group_id, payer_member_id, amount, description, split_among_member_ids, created_at")
      .single();

    if (error) {
      error.statusCode = 500;
      throw error;
    }

    res.status(201).json(formatExpense(expense));
  } catch (error) {
    next(error);
  }
});

export default router;
