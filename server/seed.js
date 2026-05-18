import dotenv from "dotenv";
import { getSupabaseClient } from "./config/db.js";

dotenv.config();

const deleteAll = async (supabase, table) => {
  const { error } = await supabase
    .from(table)
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    error.statusCode = 500;
    throw error;
  }
};

const seed = async () => {
  const supabase = getSupabaseClient();

  await deleteAll(supabase, "expenses");
  await deleteAll(supabase, "members");
  await deleteAll(supabase, "groups");

  const baseGroups = [
    { name: "Goa Trip", members: ["Vishesh", "Aman", "Priya"] },
    { name: "Office Lunch", members: ["Riya", "Karan", "Neha"] },
    { name: "Roommates", members: ["Arjun", "Meera", "Zara"] },
  ];

  const createdGroups = [];
  for (const group of baseGroups) {
    const { data: groupRow, error: groupError } = await supabase
      .from("groups")
      .insert({ name: group.name })
      .select("id, name")
      .single();

    if (groupError) {
      groupError.statusCode = 500;
      throw groupError;
    }

    const memberRows = group.members.map((member) => ({
      name: member,
      group_id: groupRow.id,
    }));

    const { data: members, error: memberError } = await supabase
      .from("members")
      .insert(memberRows)
      .select("id, name, group_id");

    if (memberError) {
      memberError.statusCode = 500;
      throw memberError;
    }

    createdGroups.push({
      ...groupRow,
      members,
    });
  }

  const expenses = [
    {
      group: 0,
      payer: 0,
      amount: 3200,
      description: "Hotel booking",
      split: [0, 1, 2],
    },
    {
      group: 0,
      payer: 1,
      amount: 1800,
      description: "Seafood dinner",
      split: [0, 1, 2],
    },
    {
      group: 0,
      payer: 2,
      amount: 900,
      description: "Taxi",
      split: [0, 1, 2],
    },
    {
      group: 1,
      payer: 0,
      amount: 1500,
      description: "Team lunch",
      split: [0, 1, 2],
    },
    {
      group: 1,
      payer: 2,
      amount: 700,
      description: "Coffee run",
      split: [1, 2],
    },
    {
      group: 2,
      payer: 1,
      amount: 2400,
      description: "Groceries",
      split: [0, 1, 2],
    },
    {
      group: 2,
      payer: 0,
      amount: 1200,
      description: "Utilities",
      split: [0, 1, 2],
    },
    {
      group: 2,
      payer: 2,
      amount: 600,
      description: "Cleaning supplies",
      split: [2],
    },
  ];

  const extended = [];
  for (let i = 0; i < 17; i += 1) {
    extended.push({
      group: i % 3,
      payer: i % 3,
      amount: 400 + i * 50,
      description: `Extra expense ${i + 1}`,
      split: [0, 1, 2],
    });
  }

  const allExpenses = [...expenses, ...extended].map((expense) => {
    const group = createdGroups[expense.group];
    const members = group.members;
    return {
      group_id: group.id,
      payer_member_id: members[expense.payer].id,
      amount: expense.amount,
      description: expense.description,
      split_among_member_ids: expense.split.map((index) => members[index].id),
    };
  });

  const { error: expenseError } = await supabase
    .from("expenses")
    .insert(allExpenses);

  if (expenseError) {
    expenseError.statusCode = 500;
    throw expenseError;
  }

  console.log("Seed data created");
  process.exit(0);
};

seed().catch((error) => {
  console.error("Seed failed", error);
  process.exit(1);
});
