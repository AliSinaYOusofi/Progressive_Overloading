// lib/workouts.js
import { supabase } from "./supabase";

/**
 * Create workout + batch insert exercises
 * formState: { name, duration, lastWeight, targetIncrease }
 * exercises: [{ name, sets_count, reps, weight, target_increase, order }]
 */
export async function createWorkout(formState, exercises = []) {
    // insert workout row
    const { data: workout, error: wErr } = await supabase
        .from("workouts")
        .insert([
            {
                user_id: (await supabase.auth.getUser()).data?.user?.id,
                name: formState.name,
                duration: formState.duration || null,
                exercises_count: exercises.length,
                last_weight: formState.lastWeight || null,
                target_increase: formState.targetIncrease || null,
            },
        ])
        .select()
        .single();

    if (wErr) throw wErr;

    if (exercises.length) {
        const payload = exercises.map((ex, i) => ({
            workout_id: workout.id,
            name: ex.name,
            order: ex.order ?? i,
            sets_count: ex.sets_count ?? (ex.sets || 0),
            reps: ex.reps ?? null,
            weight: ex.weight ?? null,
            target_increase: ex.target_increase ?? null,
        }));

        const { error: exErr } = await supabase
            .from("workout_exercises")
            .insert(payload);

        if (exErr) throw exErr;
    }

    return workout;
}

/**
 * Fetch workouts for current user (with exercises)
 */
export async function fetchWorkoutsWithExercises() {
    const userId = (await supabase.auth.getUser()).data?.user?.id;
    const { data, error } = await supabase
        .from("workouts")
        .select(
            `*, workout_exercises(id, name, "order", sets_count, reps, weight, target_increase)`
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Update workout (basic): update workout row; upsert exercises
 * exercisesToUpsert: array with existing items should include id, new ones can be sent without id.
 * exerciseIdsToDelete: array of ids to delete
 */
export async function updateWorkout(
    workoutId,
    workoutPatch,
    exercisesToUpsert = [],
    exerciseIdsToDelete = []
) {
    await supabase.from("workouts").update(workoutPatch).eq("id", workoutId);

    if (exerciseIdsToDelete.length) {
        await supabase
            .from("workout_exercises")
            .delete()
            .in("id", exerciseIdsToDelete);
    }

    if (exercisesToUpsert.length) {
        // upsert requires primary key if updating existing row; new ones must omit id
        await supabase
            .from("workout_exercises")
            .upsert(exercisesToUpsert, { onConflict: "id" });
    }
}

/**
 * Delete workout (cascades to exercises & sets via FK ON DELETE CASCADE)
 */
export async function deleteWorkout(workoutId) {
    const { error } = await supabase
        .from("workouts")
        .delete()
        .eq("id", workoutId);
    if (error) throw error;
    return true;
}
