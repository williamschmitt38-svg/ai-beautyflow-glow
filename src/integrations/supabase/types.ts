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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      agendamento: {
        Row: {
          cliente_id: string | null
          cliente_nome: string
          company_id: string
          created_at: string
          data: string
          duracao_minutos: number
          forma_pagamento:
            | Database["public"]["Enums"]["forma_pagamento_enum"]
            | null
          hora: string
          id: string
          observacoes: string | null
          pacote_cliente_id: string | null
          profissional_id: string | null
          profissional_nome: string | null
          servico_id: string | null
          servico_nome: string
          status: Database["public"]["Enums"]["agendamento_status_enum"]
          updated_at: string
          valor: number | null
        }
        Insert: {
          cliente_id?: string | null
          cliente_nome: string
          company_id: string
          created_at?: string
          data: string
          duracao_minutos?: number
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento_enum"]
            | null
          hora: string
          id?: string
          observacoes?: string | null
          pacote_cliente_id?: string | null
          profissional_id?: string | null
          profissional_nome?: string | null
          servico_id?: string | null
          servico_nome: string
          status?: Database["public"]["Enums"]["agendamento_status_enum"]
          updated_at?: string
          valor?: number | null
        }
        Update: {
          cliente_id?: string | null
          cliente_nome?: string
          company_id?: string
          created_at?: string
          data?: string
          duracao_minutos?: number
          forma_pagamento?:
            | Database["public"]["Enums"]["forma_pagamento_enum"]
            | null
          hora?: string
          id?: string
          observacoes?: string | null
          pacote_cliente_id?: string | null
          profissional_id?: string | null
          profissional_nome?: string | null
          servico_id?: string | null
          servico_nome?: string
          status?: Database["public"]["Enums"]["agendamento_status_enum"]
          updated_at?: string
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamento_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "salao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_pacote_cliente_id_fkey"
            columns: ["pacote_cliente_id"]
            isOneToOne: false
            referencedRelation: "pacote_cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissional"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamento_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servico"
            referencedColumns: ["id"]
          },
        ]
      }
      app_config: {
        Row: {
          app_name: string
          created_at: string
          id: string
          is_singleton: boolean
          super_admin_emails: Json
          system_settings: Json
          updated_at: string
        }
        Insert: {
          app_name?: string
          created_at?: string
          id?: string
          is_singleton?: boolean
          super_admin_emails?: Json
          system_settings?: Json
          updated_at?: string
        }
        Update: {
          app_name?: string
          created_at?: string
          id?: string
          is_singleton?: boolean
          super_admin_emails?: Json
          system_settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          details: Json
          id: string
          super_admin_email: string | null
          super_admin_id: string
          target_salao_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json
          id?: string
          super_admin_email?: string | null
          super_admin_id: string
          target_salao_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json
          id?: string
          super_admin_email?: string | null
          super_admin_id?: string
          target_salao_id?: string | null
        }
        Relationships: []
      }
      cliente: {
        Row: {
          ativo: boolean
          company_id: string
          created_at: string
          data_nascimento: string | null
          email: string | null
          id: string
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          company_id: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          company_id?: string
          created_at?: string
          data_nascimento?: string | null
          email?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cliente_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "salao"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamento: {
        Row: {
          agendamento_id: string | null
          categoria: string | null
          company_id: string
          created_at: string
          data: string
          descricao: string
          forma_pagamento: string | null
          id: string
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          agendamento_id?: string | null
          categoria?: string | null
          company_id: string
          created_at?: string
          data?: string
          descricao: string
          forma_pagamento?: string | null
          id?: string
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          agendamento_id?: string | null
          categoria?: string | null
          company_id?: string
          created_at?: string
          data?: string
          descricao?: string
          forma_pagamento?: string | null
          id?: string
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: []
      }
      pacote: {
        Row: {
          ativo: boolean
          company_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          servicos_incluidos: string[] | null
          total_sessoes: number
          updated_at: string
          validade_dias: number
          valor: number
        }
        Insert: {
          ativo?: boolean
          company_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          servicos_incluidos?: string[] | null
          total_sessoes: number
          updated_at?: string
          validade_dias?: number
          valor: number
        }
        Update: {
          ativo?: boolean
          company_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          servicos_incluidos?: string[] | null
          total_sessoes?: number
          updated_at?: string
          validade_dias?: number
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pacote_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "salao"
            referencedColumns: ["id"]
          },
        ]
      }
      pacote_cliente: {
        Row: {
          cliente_id: string
          cliente_nome: string | null
          company_id: string
          created_at: string
          data_inicio: string | null
          data_validade: string | null
          id: string
          pacote_id: string
          pacote_nome: string | null
          sessoes_usadas: number
          status: Database["public"]["Enums"]["pacote_cliente_status_enum"]
          total_sessoes: number
          updated_at: string
          valor_pago: number | null
        }
        Insert: {
          cliente_id: string
          cliente_nome?: string | null
          company_id: string
          created_at?: string
          data_inicio?: string | null
          data_validade?: string | null
          id?: string
          pacote_id: string
          pacote_nome?: string | null
          sessoes_usadas?: number
          status?: Database["public"]["Enums"]["pacote_cliente_status_enum"]
          total_sessoes: number
          updated_at?: string
          valor_pago?: number | null
        }
        Update: {
          cliente_id?: string
          cliente_nome?: string | null
          company_id?: string
          created_at?: string
          data_inicio?: string | null
          data_validade?: string | null
          id?: string
          pacote_id?: string
          pacote_nome?: string | null
          sessoes_usadas?: number
          status?: Database["public"]["Enums"]["pacote_cliente_status_enum"]
          total_sessoes?: number
          updated_at?: string
          valor_pago?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pacote_cliente_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "cliente"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacote_cliente_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "salao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacote_cliente_pacote_id_fkey"
            columns: ["pacote_id"]
            isOneToOne: false
            referencedRelation: "pacote"
            referencedColumns: ["id"]
          },
        ]
      }
      profissional: {
        Row: {
          ativo: boolean
          company_id: string
          created_at: string
          dias_atendimento: Json | null
          email: string | null
          especialidade: string | null
          hora_fim: string
          hora_inicio: string
          id: string
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          company_id: string
          created_at?: string
          dias_atendimento?: Json | null
          email?: string | null
          especialidade?: string | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          company_id?: string
          created_at?: string
          dias_atendimento?: Json | null
          email?: string | null
          especialidade?: string | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profissional_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "salao"
            referencedColumns: ["id"]
          },
        ]
      }
      salao: {
        Row: {
          admin_email: string
          cnpj: string | null
          cor_primaria: string
          created_at: string
          endereco: string | null
          id: string
          logo_url: string | null
          nome_fantasia: string | null
          nome_salao: string
          owner_email: string | null
          owner_nome: string | null
          plano: Database["public"]["Enums"]["plano_enum"]
          slug: string | null
          status: Database["public"]["Enums"]["salao_status_enum"]
          status_cobranca: Database["public"]["Enums"]["status_cobranca_enum"]
          telefone: string | null
          trial_ate: string | null
          ultimo_acesso: string | null
          updated_at: string
          valor_plano: number
          whatsapp: string | null
        }
        Insert: {
          admin_email: string
          cnpj?: string | null
          cor_primaria?: string
          created_at?: string
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome_fantasia?: string | null
          nome_salao: string
          owner_email?: string | null
          owner_nome?: string | null
          plano?: Database["public"]["Enums"]["plano_enum"]
          slug?: string | null
          status?: Database["public"]["Enums"]["salao_status_enum"]
          status_cobranca?: Database["public"]["Enums"]["status_cobranca_enum"]
          telefone?: string | null
          trial_ate?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          valor_plano?: number
          whatsapp?: string | null
        }
        Update: {
          admin_email?: string
          cnpj?: string | null
          cor_primaria?: string
          created_at?: string
          endereco?: string | null
          id?: string
          logo_url?: string | null
          nome_fantasia?: string | null
          nome_salao?: string
          owner_email?: string | null
          owner_nome?: string | null
          plano?: Database["public"]["Enums"]["plano_enum"]
          slug?: string | null
          status?: Database["public"]["Enums"]["salao_status_enum"]
          status_cobranca?: Database["public"]["Enums"]["status_cobranca_enum"]
          telefone?: string | null
          trial_ate?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          valor_plano?: number
          whatsapp?: string | null
        }
        Relationships: []
      }
      salao_user: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string | null
          role: Database["public"]["Enums"]["salao_user_role_enum"]
          salao_id: string
          ultimo_login: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["salao_user_role_enum"]
          salao_id: string
          ultimo_login?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string | null
          role?: Database["public"]["Enums"]["salao_user_role_enum"]
          salao_id?: string
          ultimo_login?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salao_user_salao_id_fkey"
            columns: ["salao_id"]
            isOneToOne: false
            referencedRelation: "salao"
            referencedColumns: ["id"]
          },
        ]
      }
      servico: {
        Row: {
          ativo: boolean
          categoria:
            | Database["public"]["Enums"]["servico_categoria_enum"]
            | null
          company_id: string
          created_at: string
          descricao: string | null
          duracao_minutos: number
          id: string
          nome: string
          updated_at: string
          valor: number
        }
        Insert: {
          ativo?: boolean
          categoria?:
            | Database["public"]["Enums"]["servico_categoria_enum"]
            | null
          company_id: string
          created_at?: string
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome: string
          updated_at?: string
          valor: number
        }
        Update: {
          ativo?: boolean
          categoria?:
            | Database["public"]["Enums"]["servico_categoria_enum"]
            | null
          company_id?: string
          created_at?: string
          descricao?: string | null
          duracao_minutos?: number
          id?: string
          nome?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "servico_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "salao"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          salao_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          salao_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          salao_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_exists: { Args: never; Returns: boolean }
      claim_super_admin_if_empty: { Args: never; Returns: boolean }
      current_salao_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_salao_access: { Args: { _salao_id: string }; Returns: boolean }
      has_salao_role: {
        Args: {
          _roles: Database["public"]["Enums"]["salao_user_role_enum"][]
          _salao_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      super_admin_claim_available: { Args: never; Returns: boolean }
    }
    Enums: {
      agendamento_status_enum:
        | "agendado"
        | "confirmado"
        | "chegou"
        | "concluido"
        | "cancelado"
      app_role:
        | "admin"
        | "user"
        | "super_admin"
        | "operacional"
        | "profissional"
        | "recepcao"
      forma_pagamento_enum:
        | "Pix"
        | "Cartao"
        | "Dinheiro"
        | "Transferencia"
        | "Pacote"
      pacote_cliente_status_enum:
        | "ativo"
        | "concluido"
        | "vencido"
        | "cancelado"
      plano_enum: "starter" | "pro" | "enterprise"
      salao_status_enum: "ativo" | "bloqueado" | "pendente"
      salao_user_role_enum:
        | "owner"
        | "admin"
        | "profissional"
        | "recepcao"
        | "financeiro"
      servico_categoria_enum:
        | "Cabelo"
        | "Unhas"
        | "Estetica"
        | "Maquiagem"
        | "Massagem"
      status_cobranca_enum:
        | "trial"
        | "ativo"
        | "inadimplente"
        | "suspenso"
        | "cancelado"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      agendamento_status_enum: [
        "agendado",
        "confirmado",
        "chegou",
        "concluido",
        "cancelado",
      ],
      app_role: [
        "admin",
        "user",
        "super_admin",
        "operacional",
        "profissional",
        "recepcao",
      ],
      forma_pagamento_enum: [
        "Pix",
        "Cartao",
        "Dinheiro",
        "Transferencia",
        "Pacote",
      ],
      pacote_cliente_status_enum: [
        "ativo",
        "concluido",
        "vencido",
        "cancelado",
      ],
      plano_enum: ["starter", "pro", "enterprise"],
      salao_status_enum: ["ativo", "bloqueado", "pendente"],
      salao_user_role_enum: [
        "owner",
        "admin",
        "profissional",
        "recepcao",
        "financeiro",
      ],
      servico_categoria_enum: [
        "Cabelo",
        "Unhas",
        "Estetica",
        "Maquiagem",
        "Massagem",
      ],
      status_cobranca_enum: [
        "trial",
        "ativo",
        "inadimplente",
        "suspenso",
        "cancelado",
      ],
    },
  },
} as const
