export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MemberStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING_VERIFICATION'
export type DocumentType = 'AADHAAR' | 'VOTER_ID' | 'TVK_ID' | 'PHOTO'

export interface Database {
  public: {
    Tables: {
      wards: {
        Row: {
          id: number
          ward_number: number
          name: string
          active: boolean
          created_at: string
        }
        Insert: {
          id?: number
          ward_number: number
          name: string
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          ward_number?: number
          name?: string
          active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          id: string
          member_id: string
          full_name: string
          father_name: string
          mobile: string
          aadhaar_number: string
          voter_id: string | null
          ward_number: number
          address: string
          date_of_birth: string
          email: string | null
          status: MemberStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id?: string
          full_name: string
          father_name: string
          mobile: string
          aadhaar_number: string
          voter_id?: string | null
          ward_number: number
          address: string
          date_of_birth: string
          email?: string | null
          status?: MemberStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          full_name?: string
          father_name?: string
          mobile?: string
          aadhaar_number?: string
          voter_id?: string | null
          ward_number?: number
          address?: string
          date_of_birth?: string
          email?: string | null
          status?: MemberStatus
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'members_ward_number_fkey'
            columns: ['ward_number']
            isOneToOne: false
            referencedRelation: 'wards'
            referencedColumns: ['ward_number']
          },
        ]
      }
      member_documents: {
        Row: {
          id: string
          member_id: string
          document_type: DocumentType
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          document_type: DocumentType
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          document_type?: DocumentType
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'member_documents_member_id_fkey'
            columns: ['member_id']
            isOneToOne: false
            referencedRelation: 'members'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_dashboard_stats: {
        Args: Record<string, never>
        Returns: {
          ward_number: number
          ward_name: string
          member_count: number
          active_count: number
          pending_count: number
          inactive_count: number
        }[]
      }
      get_member_count_by_ward: {
        Args: { p_ward: number }
        Returns: number
      }
      find_member_duplicates: {
        Args: { p_mobile: string; p_aadhaar: string; p_voter: string }
        Returns: {
          member_id: string
          full_name: string
          ward_number: number
          mobile: string
          status: MemberStatus
        }[]
      }
      register_member: {
        Args: {
          p_id: string
          p_full_name: string
          p_father_name: string
          p_mobile: string
          p_aadhaar_number: string
          p_voter_id: string | null
          p_ward_number: number
          p_address: string
          p_date_of_birth: string
          p_email: string | null
        }
        Returns: { member_id: string }[]
      }
    }
    Enums: {
      member_status: MemberStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
