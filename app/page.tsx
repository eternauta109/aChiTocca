'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  TextField,
  IconButton,
  Chip,
  Alert,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress,
  Paper,
  Tooltip,
  Avatar,
  Stack,
  Fade,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import LocalCafeIcon from '@mui/icons-material/LocalCafe'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import PeopleIcon from '@mui/icons-material/People'
import CoffeeIcon from '@mui/icons-material/Coffee'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import SortIcon from '@mui/icons-material/Sort'
import type { User, SortField, SortOrder } from '@/lib/types'

// ─── helpers ────────────────────────────────────────────────────────────────

function getNextBuyer(users: User[]): User | null {
  if (users.length === 0) return null
  return users.reduce((min, user) => {
    if (user.coffeeCount < min.coffeeCount) return user
    if (user.coffeeCount === min.coffeeCount) {
      if (min.lastBought === null) return min
      if (user.lastBought === null) return user
      return new Date(user.lastBought) < new Date(min.lastBought) ? user : min
    }
    return min
  })
}

function sortUsers(users: User[], field: SortField, order: SortOrder): User[] {
  return [...users].sort((a, b) => {
    let cmp = 0
    if (field === 'name') cmp = a.name.localeCompare(b.name)
    else if (field === 'coffeeCount') cmp = a.coffeeCount - b.coffeeCount
    else if (field === 'lastBought') {
      if (!a.lastBought && !b.lastBought) cmp = 0
      else if (!a.lastBought) cmp = -1
      else if (!b.lastBought) cmp = 1
      else cmp = new Date(a.lastBought).getTime() - new Date(b.lastBought).getTime()
    }
    return order === 'asc' ? cmp : -cmp
  })
}

function formatDate(iso: string | null): string {
  if (!iso) return 'Mai'
  const d = new Date(iso)
  return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = [
  '#5D4037', '#6A1B9A', '#1565C0', '#2E7D32', '#C62828',
  '#00695C', '#4527A0', '#283593', '#0277BD', '#6D4C41',
]

function avatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

// ─── Snackbar helper ─────────────────────────────────────────────────────────

interface SnackState { open: boolean; message: string; severity: 'success' | 'error' | 'info' }

// ─── Tab: Caffè ──────────────────────────────────────────────────────────────

function CoffeeTab({ users, onCoffee, loading }: {
  users: User[]
  onCoffee: (id: string) => void
  loading: boolean
}) {
  const nextBuyer = getNextBuyer(users)
  const ranked = sortUsers(users, 'coffeeCount', 'asc')

  const medalColor = (i: number) =>
    i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : undefined

  if (users.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <LocalCafeIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Nessun utente ancora.
        </Typography>
        <Typography color="text.secondary">
          Vai nella scheda <strong>Utenti</strong> per aggiungerne.
        </Typography>
      </Box>
    )
  }

  return (
    <Box>
      {/* Hero: prossimo a offrire */}
      <Paper
        elevation={0}
        sx={{
          background: 'linear-gradient(135deg, #5D4037 0%, #8B6B61 100%)',
          borderRadius: 4,
          p: { xs: 3, sm: 4 },
          mb: 3,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            fontSize: 120,
            opacity: 0.08,
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          ☕
        </Box>
        <Typography variant="overline" sx={{ opacity: 0.8, letterSpacing: 2 }}>
          Tocca a…
        </Typography>
        <Typography variant="h4" fontWeight={700} mb={0.5}>
          {nextBuyer?.name}
        </Typography>
        <Typography sx={{ opacity: 0.8, mb: 3 }}>
          Ha offerto <strong>{nextBuyer?.coffeeCount}</strong>{' '}
          {nextBuyer?.coffeeCount === 1 ? 'volta' : 'volte'}
          {nextBuyer?.lastBought && (
            <> · Ultima: {formatDate(nextBuyer.lastBought)}</>
          )}
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CoffeeIcon />}
          disabled={loading || !nextBuyer}
          onClick={() => nextBuyer && onCoffee(nextBuyer.id)}
          sx={{
            bgcolor: '#FF8F00',
            '&:hover': { bgcolor: '#C56000' },
            px: 4,
            py: 1.5,
            fontSize: '1rem',
            boxShadow: 3,
          }}
        >
          ☕ Ha offerto il caffè!
        </Button>
      </Paper>

      {/* Classifica */}
      <Typography variant="h6" mb={2} display="flex" alignItems="center" gap={1}>
        <EmojiEventsIcon sx={{ color: 'secondary.main' }} /> Classifica
      </Typography>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <List disablePadding>
          {ranked.map((user, i) => (
            <React.Fragment key={user.id}>
              {i > 0 && <Divider />}
              <ListItem
                sx={{
                  py: 1.5,
                  bgcolor: user.id === nextBuyer?.id ? 'rgba(93,64,55,0.06)' : 'transparent',
                  transition: 'background 0.3s',
                }}
                secondaryAction={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    {user.id === nextBuyer?.id && (
                      <Chip label="Prossimo" size="small" color="warning" />
                    )}
                    <Tooltip title="Segna caffè offerto">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CoffeeIcon />}
                        disabled={loading}
                        onClick={() => onCoffee(user.id)}
                        sx={{ minWidth: 100 }}
                      >
                        Offerto
                      </Button>
                    </Tooltip>
                  </Stack>
                }
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      bgcolor: avatarColor(user.name),
                      width: 40,
                      height: 40,
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    {i < 3 ? (
                      <Typography fontSize="1.2rem">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                      </Typography>
                    ) : (
                      initials(user.name)
                    )}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography fontWeight={user.id === nextBuyer?.id ? 700 : 400}>
                      {user.name}
                    </Typography>
                  }
                  secondary={
                    <Stack direction="row" spacing={1} alignItems="center" mt={0.3}>
                      <Chip
                        icon={<CoffeeIcon />}
                        label={`${user.coffeeCount} caffè`}
                        size="small"
                        sx={{ bgcolor: medalColor(i) ? `${medalColor(i)}22` : undefined }}
                      />
                      <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.3}>
                        <AccessTimeIcon sx={{ fontSize: 12 }} />
                        {formatDate(user.lastBought)}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  )
}

// ─── Tab: Utenti ─────────────────────────────────────────────────────────────

function UsersTab({ users, onAdd, onDelete, loading }: {
  users: User[]
  onAdd: (name: string) => void
  onDelete: (id: string) => void
  loading: boolean
}) {
  const [newName, setNewName] = useState('')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const sorted = sortUsers(users, sortField, sortOrder)

  const handleAdd = () => {
    if (!newName.trim()) return
    onAdd(newName.trim())
    setNewName('')
  }

  return (
    <Box>
      {/* Form aggiunta */}
      <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1.5}>
          Aggiungi utente
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            size="small"
            label="Nome"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="es. Mario Rossi"
          />
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={handleAdd}
            disabled={!newName.trim() || loading}
            sx={{ minWidth: 140, whiteSpace: 'nowrap' }}
          >
            Aggiungi
          </Button>
        </Stack>
      </Paper>

      {/* Ordinamento */}
      {users.length > 0 && (
        <Stack direction="row" spacing={1.5} mb={2} alignItems="center">
          <SortIcon fontSize="small" color="action" />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Ordina per</InputLabel>
            <Select
              value={sortField}
              label="Ordina per"
              onChange={(e) => setSortField(e.target.value as SortField)}
            >
              <MenuItem value="name">Nome</MenuItem>
              <MenuItem value="coffeeCount">N. caffè</MenuItem>
              <MenuItem value="lastBought">Ultima volta</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel>Ordine</InputLabel>
            <Select
              value={sortOrder}
              label="Ordine"
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            >
              <MenuItem value="asc">Crescente</MenuItem>
              <MenuItem value="desc">Decrescente</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" color="text.secondary">
            {users.length} {users.length === 1 ? 'utente' : 'utenti'}
          </Typography>
        </Stack>
      )}

      {/* Lista utenti */}
      {users.length === 0 ? (
        <Box textAlign="center" py={6}>
          <PeopleIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">Nessun utente ancora. Aggiungine uno!</Typography>
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <List disablePadding>
            {sorted.map((user, i) => (
              <React.Fragment key={user.id}>
                {i > 0 && <Divider />}
                <ListItem
                  sx={{ py: 1.5 }}
                  secondaryAction={
                    <Tooltip title="Elimina utente">
                      <IconButton
                        edge="end"
                        color="error"
                        size="small"
                        disabled={loading}
                        onClick={() => onDelete(user.id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: avatarColor(user.name), fontWeight: 700, fontSize: '0.85rem' }}>
                      {initials(user.name)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography fontWeight={500}>{user.name}</Typography>}
                    secondary={
                      <Stack direction="row" spacing={1} mt={0.3} alignItems="center">
                        <Chip icon={<CoffeeIcon />} label={`${user.coffeeCount} caffè`} size="small" />
                        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.3}>
                          <AccessTimeIcon sx={{ fontSize: 12 }} />
                          {formatDate(user.lastBought)}
                        </Typography>
                      </Stack>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────

export default function Home() {
  const [tab, setTab] = useState(0)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [snack, setSnack] = useState<SnackState>({ open: false, message: '', severity: 'success' })

  const fetchUsers = useCallback(async () => {
    const res = await fetch('/api/users')
    if (res.ok) setUsers(await res.json() as User[])
  }, [])

  useEffect(() => { void fetchUsers() }, [fetchUsers])

  const showSnack = (message: string, severity: SnackState['severity'] = 'success') =>
    setSnack({ open: true, message, severity })

  const handleCoffee = async (userId: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/coffee/${userId}`, { method: 'POST' })
      if (res.ok) {
        const updated = await res.json() as User
        setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
        showSnack(`☕ ${updated.name} ha offerto il caffè!`)
      } else {
        showSnack('Errore nel registrare il caffè', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async (name: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const newUser = await res.json() as User
        setUsers((prev) => [...prev, newUser])
        showSnack(`👤 ${newUser.name} aggiunto!`)
      } else {
        showSnack('Errore nell\'aggiunta utente', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (id: string) => {
    const user = users.find((u) => u.id === id)
    setLoading(true)
    try {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id))
        showSnack(`🗑️ ${user?.name ?? 'Utente'} eliminato`, 'info')
      } else {
        showSnack('Errore nell\'eliminazione utente', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minHeight="100vh" bgcolor="background.default">
      {/* Header */}
      <Paper
        elevation={0}
        square
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'primary.main',
          color: '#fff',
        }}
      >
        <Container maxWidth="md">
          <Box py={2} display="flex" alignItems="center" gap={1.5}>
            <LocalCafeIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight={700}>
              Chi Offre il Caffè?
            </Typography>
          </Box>
        </Container>
      </Paper>

      {/* Tabs */}
      <Paper elevation={0} square sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container maxWidth="md">
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v as number)}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<CoffeeIcon />} iconPosition="start" label="Caffè" />
            <Tab icon={<PeopleIcon />} iconPosition="start" label="Utenti" />
          </Tabs>
        </Container>
      </Paper>

      {/* Contenuto */}
      <Container maxWidth="md" sx={{ py: 3 }}>
        <Fade in key={tab} timeout={250}>
          <Box>
            {tab === 0 && (
              <CoffeeTab users={users} onCoffee={handleCoffee} loading={loading} />
            )}
            {tab === 1 && (
              <UsersTab
                users={users}
                onAdd={handleAddUser}
                onDelete={handleDeleteUser}
                loading={loading}
              />
            )}
          </Box>
        </Fade>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          sx={{ borderRadius: 3 }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}
