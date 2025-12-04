import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MedicationNotesAPI } from "../api/endpoints";
import type { MedicationNote } from "../api/types";

const MEDICATION_NOTES_QUERY_KEY = ["medication-notes"] as const;

export function useMedicationNotes() {
  return useQuery<MedicationNote[]>({
    queryKey: MEDICATION_NOTES_QUERY_KEY,
    queryFn: () => MedicationNotesAPI.list(),
  });
}

export function useMedicationNotesByResident(resident_id: string) {
  return useQuery<MedicationNote[]>({
    queryKey: [...MEDICATION_NOTES_QUERY_KEY, "resident", resident_id],
    queryFn: () => MedicationNotesAPI.getByResident(resident_id),
    enabled: !!resident_id,
  });
}

export function useActiveMedicationNotesByResident(resident_id: string) {
  return useQuery<MedicationNote[]>({
    queryKey: [...MEDICATION_NOTES_QUERY_KEY, "resident", resident_id, "active"],
    queryFn: () => MedicationNotesAPI.getActiveByResident(resident_id),
    enabled: !!resident_id,
  });
}

export function useMedicationNoteById(id: number) {
  return useQuery<MedicationNote>({
    queryKey: [...MEDICATION_NOTES_QUERY_KEY, id],
    queryFn: () => MedicationNotesAPI.get(id),
    enabled: !!id,
  });
}

export function useCreateMedicationNote() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<MedicationNote>) => MedicationNotesAPI.create(data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: MEDICATION_NOTES_QUERY_KEY });
    },
  });
}

export function useUpdateMedicationNote() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MedicationNote> }) =>
      MedicationNotesAPI.update(id, data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: MEDICATION_NOTES_QUERY_KEY });
    },
  });
}

export function useDeleteMedicationNote() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => MedicationNotesAPI.remove(id),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: MEDICATION_NOTES_QUERY_KEY });
    },
  });
}

