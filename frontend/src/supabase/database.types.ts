export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      borradores: {
        Row: {
          anio: number
          estado_json: Json
          id: number
          id_sector: number
          jefe_id: string
          mes: number
          ult_mod: string | null
        }
        Insert: {
          anio: number
          estado_json: Json
          id?: number
          id_sector: number
          jefe_id: string
          mes: number
          ult_mod?: string | null
        }
        Update: {
          anio?: number
          estado_json?: Json
          id?: number
          id_sector?: number
          jefe_id?: string
          mes?: number
          ult_mod?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_borrador_jefe"
            columns: ["jefe_id"]
            isOneToOne: false
            referencedRelation: "enfermeros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_borrador_sector"
            columns: ["id_sector"]
            isOneToOne: false
            referencedRelation: "sectores"
            referencedColumns: ["id"]
          },
        ]
      }
      enfermeros: {
        Row: {
          apellido: string
          dni: string
          especialidad: string | null
          estado: string | null
          id: string
          id_jefe: string | null
          matricula: string | null
          nombre: string
          rol: string
        }
        Insert: {
          apellido: string
          dni: string
          especialidad?: string | null
          estado?: string | null
          id: string
          id_jefe?: string | null
          matricula?: string | null
          nombre: string
          rol: string
        }
        Update: {
          apellido?: string
          dni?: string
          especialidad?: string | null
          estado?: string | null
          id?: string
          id_jefe?: string | null
          matricula?: string | null
          nombre?: string
          rol?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_enfermero_jefe"
            columns: ["id_jefe"]
            isOneToOne: false
            referencedRelation: "enfermeros"
            referencedColumns: ["id"]
          },
        ]
      }
      hospitales: {
        Row: {
          direccion: string | null
          id: number
          nombre: string
          provincia_id: number | null
        }
        Insert: {
          direccion?: string | null
          id?: number
          nombre: string
          provincia_id?: number | null
        }
        Update: {
          direccion?: string | null
          id?: number
          nombre?: string
          provincia_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hospitales_provincia_id_fkey"
            columns: ["provincia_id"]
            isOneToOne: false
            referencedRelation: "provincias"
            referencedColumns: ["id"]
          },
        ]
      }
      provincias: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      sectores: {
        Row: {
          id: number
          nombre: string
        }
        Insert: {
          id?: number
          nombre: string
        }
        Update: {
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      tipos_turno: {
        Row: {
          cod: string
          descripcion: string
          hora_fin: string | null
          hora_inicio: string | null
          id: number
        }
        Insert: {
          cod: string
          descripcion: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: number
        }
        Update: {
          cod?: string
          descripcion?: string
          hora_fin?: string | null
          hora_inicio?: string | null
          id?: number
        }
        Relationships: []
      }
      trabaja_en: {
        Row: {
          activo: boolean | null
          enfermero_id: string
          fecha_inicio: string | null
          hospital_id: number
          id: number
          sector_id: number | null
        }
        Insert: {
          activo?: boolean | null
          enfermero_id: string
          fecha_inicio?: string | null
          hospital_id: number
          id?: number
          sector_id?: number | null
        }
        Update: {
          activo?: boolean | null
          enfermero_id?: string
          fecha_inicio?: string | null
          hospital_id?: number
          id?: number
          sector_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trabaja_en_enfermero_id_fkey"
            columns: ["enfermero_id"]
            isOneToOne: false
            referencedRelation: "enfermeros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trabaja_en_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trabaja_en_sector_id_fkey"
            columns: ["sector_id"]
            isOneToOne: false
            referencedRelation: "sectores"
            referencedColumns: ["id"]
          },
        ]
      }
      turnos_asignados: {
        Row: {
          enfermero_id: string
          fecha: string
          id: number
          jefe_enf_id: string
          tipo_turno_id: number
        }
        Insert: {
          enfermero_id: string
          fecha: string
          id?: number
          jefe_enf_id: string
          tipo_turno_id: number
        }
        Update: {
          enfermero_id?: string
          fecha?: string
          id?: number
          jefe_enf_id?: string
          tipo_turno_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_turno_enfermero"
            columns: ["enfermero_id"]
            isOneToOne: false
            referencedRelation: "enfermeros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_turno_jefe"
            columns: ["jefe_enf_id"]
            isOneToOne: false
            referencedRelation: "enfermeros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_turno_tipo"
            columns: ["tipo_turno_id"]
            isOneToOne: false
            referencedRelation: "tipos_turno"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
