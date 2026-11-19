import { useEffect, useState } from 'react'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Alert, Button, Flex, Result, Spin, Typography } from 'antd'
import { useBox, useEngine, useParty } from '@pkhex-everywhere/react'
import { useNavigate } from '../../host'
import { useTranslation } from '../../i18n'
import { routes } from '../../routes'
import { DraftEditor } from './DraftEditor'
import { editorView } from './editorView'
import { ReadOnlyPokemon } from './ReadOnlyPokemon'
import { SaveDropdown } from './SaveDropdown'

interface PokemonEditorPageProps {
  source?: string
  id?: string
}

export default function PokemonEditorPage({ source, id }: PokemonEditorPageProps) {
  const { t } = useTranslation()
  const { party } = useParty()
  const { box } = useBox()
  const engine = useEngine()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<'opening' | 'editing' | 'saving'>('opening')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const saved = (source === 'party' ? party : box).find((pokemon) => pokemon.id === id)
  const key = saved && JSON.stringify(saved.at)
  const view = saved && editorView(saved)

  useEffect(() => {
    if (!saved || view !== 'editor') return
    let current = true
    void engine.pokemon.edit(saved.at).then(() => current && setPhase('editing'))
    return () => {
      current = false
    }
  }, [engine, key, view])

  const isParty = source === 'party' || saved?.at?.source === 'party'
  const parentRoute = isParty ? routes.party : routes.box
  const parentLabel = isParty
    ? t('editor.returnToParty', 'Voltar para a Party')
    : t('editor.returnToBox', 'Voltar para as Boxes')

  const handleReturnToParent = () => {
    navigate(parentRoute)
  }

  // Commit clears the draft in the engine, then we re-open it so the user can continue editing.
  const save = async () => {
    if (!saved) return
    setPhase('saving')
    try {
      const committed = await engine.pokemon.commit()
      if (committed !== id) {
        await navigate(routes.pokemon({ at: saved.at, id: committed }), { replace: true })
      }
      await engine.pokemon.edit(saved.at)
      setSaveSuccess(true)
      setPhase('editing')
    } catch (error) {
      setPhase('editing')
      throw error
    }
  }

  if (phase === 'saving') return <Spin />
  if (!saved) return <Result status="404" title={t('editor.pokemonNotFound', 'Pokémon not found')} />
  if (view === 'read-only') return <ReadOnlyPokemon at={saved.at} onBack={handleReturnToParent} />
  if (phase === 'opening') return <Spin />

  const notice = saveSuccess ? (
    <Alert
      type="success"
      showIcon
      closable
      onClose={() => setSaveSuccess(false)}
      style={{ borderRadius: 8 }}
      message={
        <Flex justify="space-between" align="center" wrap="wrap" gap={8} style={{ width: '100%' }}>
          <Typography.Text strong style={{ fontSize: 14 }}>
            {t('editor.saveSuccess', 'Alterações salvas com sucesso!')}
          </Typography.Text>
          <Button
            type="primary"
            size="small"
            icon={<ArrowLeftOutlined />}
            onClick={handleReturnToParent}
          >
            {parentLabel}
          </Button>
        </Flex>
      }
      description={
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          {isParty
            ? t(
                'editor.savedInPartyNotice',
                'O Pokémon foi atualizado na sua Party. Você pode continuar editando ou retornar à equipe.',
              )
            : t(
                'editor.savedInBoxNotice',
                'O Pokémon foi atualizado nas Boxes. Você pode continuar editando ou retornar às caixas.',
              )}
        </Typography.Text>
      }
    />
  ) : null

  return (
    <DraftEditor
      actions={<SaveDropdown onSave={save} />}
      notice={notice}
      onBack={handleReturnToParent}
    />
  )
}
