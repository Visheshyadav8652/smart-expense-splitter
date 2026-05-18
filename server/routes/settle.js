import express from "express";
import { z } from "zod";
import { computeBalances } from "../utils/balances.js";
import { settleBalances } from "../utils/settle.js";
import { validate } from "../middleware/validate.js";
import { getSupabaseClient } from "../config/db.js";

const router = express.Router();

const groupIdSchema = z.object({
  groupId: z.string().min(1),
});

const formatGroup = (group) => ({
  _id: group.id,
  name: group.name,
  members: (group.members || []).map((member) => ({
    _id: member.id,
    name: member.name,
  })),
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

router.get("/balances", validate(groupIdSchema, "query"), async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { groupId } = req.query;

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id, name, members(id, name)")
      .eq("id", groupId)
      .maybeSingle();

    if (groupError) {
      groupError.statusCode = 500;
      throw groupError;
    }

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("id, group_id, payer_member_id, amount, description, split_among_member_ids, created_at")
      .eq("group_id", groupId);

    if (expensesError) {
      expensesError.statusCode = 500;
      throw expensesError;
    }

    const balances = computeBalances({
      group: formatGroup(group),
      expenses: (expenses || []).map(formatExpense),
    });
    res.json(balances);
  } catch (error) {
    next(error);
  }
});

router.get("/settle", validate(groupIdSchema, "query"), async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { groupId } = req.query;

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .select("id, name, members(id, name)")
      .eq("id", groupId)
      .maybeSingle();

    if (groupError) {
      groupError.statusCode = 500;
      throw groupError;
    }

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    const { data: expenses, error: expensesError } = await supabase
      .from("expenses")
      .select("id, group_id, payer_member_id, amount, description, split_among_member_ids, created_at")
      .eq("group_id", groupId);

    if (expensesError) {
      expensesError.statusCode = 500;
      throw expensesError;
    }

    const balances = computeBalances({
      group: formatGroup(group),
      expenses: (expenses || []).map(formatExpense),
    });
    const transactions = settleBalances(balances);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

export default router;
