import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { config } from '@/constants/config'
import { MOCK_TICKET_DETAILS } from '@/mocks/ticketDetail.mock'
import { TicketDetail } from '@/features/dashboard/types'

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

const getTicketDetail = async (id: string): Promise<TicketDetail> => {
  if (config.USE_MOCK) {
    await delay(500)
    const ticket = MOCK_TICKET_DETAILS[id]
    if (!ticket) throw new Error('Tiket tidak ditemukan')
    return ticket
  }
  // TODO: ganti dengan real API
  // const { data } = await api.get(`/tickets/${id}`)
  // return data.data
  throw new Error('API belum tersedia')
}

const cancelTicket = async (id: string): Promise<void> => {
  if (config.USE_MOCK) {
    await delay(800)
    return
  }
  // TODO: ganti dengan real API
  // await api.patch(`/tickets/${id}/cancel`)
}

export const useTicketDetail = (id: string) => {
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [additionalDetailExpanded, setAdditionalDetailExpanded] = useState(false)
  const [attachmentsExpanded, setAttachmentsExpanded] = useState(false)

  const query = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => getTicketDetail(id),
    enabled: !!id,
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelTicket(id),
    onSuccess: () => {
      setCancelModalVisible(false)
    },
  })

  const canCancel =
    query.data?.status === 'open' ||
    query.data?.status === 'pending' ||
    query.data?.status === 'on_hold'

  return {
    ticket: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    cancelModalVisible,
    setCancelModalVisible,
    additionalDetailExpanded,
    setAdditionalDetailExpanded,
    attachmentsExpanded,
    setAttachmentsExpanded,
    handleCancel: cancelMutation.mutate,
    isCancelling: cancelMutation.isPending,
    canCancel,
  }
}
