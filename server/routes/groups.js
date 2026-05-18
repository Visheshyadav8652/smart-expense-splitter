import express from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { getSupabaseClient } from "../config/db.js";

const router = express.Router();

const createGroupSchema = z.object({
  name: z.string().min(1),
  members: z.array(z.string().min(1)).min(1),
});

const formatGroup = (group) => ({
  _id: group.id,
  name: group.name,
  members: (group.members || []).map((member) => ({
    _id: member.id,
    name: member.name,
  })),
});

router.get("/", async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("groups")
      .select("id, name, created_at, members(id, name)")
      .order("created_at", { ascending: false });

    if (error) {
      error.statusCode = 500;
      throw error;
    }

    res.json((data || []).map(formatGroup));
  } catch (error) {
    next(error);
  }
});

router.post("/", validate(createGroupSchema), async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { name, members } = req.body;

    const { data: group, error: groupError } = await supabase
      .from("groups")
      .insert({ name })
      .select("id, name, created_at")
      .single();

    if (groupError) {
      groupError.statusCode = 500;
      throw groupError;
    }

    const memberRows = members.map((member) => ({
      name: member,
      group_id: group.id,
    }));

    const { data: createdMembers, error: membersError } = await supabase
      .from("members")
      .insert(memberRows)
      .select("id, name");

    if (membersError) {
      membersError.statusCode = 500;
      throw membersError;
    }

    res.status(201).json(
      formatGroup({
        ...group,
        members: createdMembers || [],
      })
    );
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("groups")
      .select("id, name, created_at, members(id, name)")
      .eq("id", req.params.id)
      .maybeSingle();

    if (error) {
      error.statusCode = 500;
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json(formatGroup(data));
  } catch (error) {
    next(error);
  }
});

export default router;
