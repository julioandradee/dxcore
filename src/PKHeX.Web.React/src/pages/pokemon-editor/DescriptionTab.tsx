import { useState } from 'react'
import {
  IdcardOutlined,
  InfoCircleOutlined,
  SlidersOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Flex,
  InputNumber,
  Radio,
  Row,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd'
import { draftHandle, type PokemonGender } from '@pkhex-everywhere/engine'
import { useQuery } from '@pkhex-everywhere/react'
import { ItemSelect } from '../../components/ItemSelect'
import { TypeBadge } from '../../components/TypeBadge'
import { useTranslation } from '../../i18n'
import { getNatureDescription, getNatureInfo, isNatureSuitableForStats } from '../../utils/natureEffects'
import { ChoiceSelect } from './ChoiceSelect'
import { ExperienceModal } from './ExperienceModal'
import { isLocked } from './locked'
import { NatureSelect } from './NatureSelect'
import { useDraft } from './useDraft'

const genders: { value: PokemonGender; label: string }[] = [
  { value: 'male', label: '♂' },
  { value: 'female', label: '♀' },
  { value: 'genderless', label: '⚲' },
]

export function DescriptionTab() {
  const { details, submit } = useDraft()
  const options = useQuery('pokemon.options', draftHandle)
  const natures = useQuery('game.natures')
  const balls = useQuery('game.balls')
  const languages = useQuery('game.languages')
  const [editingExperience, setEditingExperience] = useState(false)
  const [natureInfoVisible, setNatureInfoVisible] = useState(false)
  const { t } = useTranslation()

  const natureInfo = getNatureInfo(details.nature)
  const natureSuitable = isNatureSuitableForStats(details.nature, details.stats)

  return (
    <Flex vertical gap={16}>
      {/* Seção 1: Identificação & Características Básicas */}
      <Card
        size="small"
        title={
          <Space size={8}>
            <IdcardOutlined style={{ color: '#1677ff' }} />
            <span>{t('editor.sections.identity', 'Identificação & Características')}</span>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {/* Espécie */}
          <Col xs={24} sm={12}>
            <div className="editor-field-item">
              <span className="editor-field-label">{t('editor.fields.species', 'Espécie')}</span>
              <ChoiceSelect
                label={t('editor.fields.species', 'Espécie')}
                choices={options.species}
                value={details.species}
                onChange={(species) => submit({ species })}
              />
            </div>
          </Col>

          {/* Apelido */}
          <Col xs={24} sm={12}>
            <div className="editor-field-item">
              <span className="editor-field-label">{t('editor.fields.nickname', 'Apelido')}</span>
              <div
                style={{
                  minHeight: 32,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 11px',
                  borderRadius: 6,
                  border: '1px solid var(--ant-color-border, #d9d9d9)',
                }}
              >
                <Typography.Text
                  editable={{
                    text: details.nickname,
                    onChange: (nickname) => submit({ nickname }),
                  }}
                  style={{ width: '100%' }}
                >
                  {details.nickname}
                </Typography.Text>
              </div>
            </div>
          </Col>

          {/* Tipos */}
          <Col xs={24} sm={12}>
            <div className="editor-field-item">
              <span className="editor-field-label">{t('editor.fields.types', 'Tipos')}</span>
              <div style={{ minHeight: 32, display: 'flex', alignItems: 'center' }}>
                <Space size={6} wrap align="center">
                  {details.types.map((type) => (
                    <TypeBadge key={type} typeId={type} size="middle" />
                  ))}
                </Space>
              </div>
            </div>
          </Col>

          {/* Gênero */}
          <Col xs={24} sm={12}>
            <div className="editor-field-item">
              <span className="editor-field-label">{t('editor.fields.gender', 'Gênero')}</span>
              <Radio.Group
                aria-label={t('editor.fields.gender', 'Gênero')}
                optionType="button"
                buttonStyle="solid"
                value={details.gender}
                disabled={isLocked(options, 'gender')}
                options={genders.filter((gender) => gender.value !== 'genderless' || details.gender === 'genderless')}
                onChange={(event) => submit({ gender: event.target.value as PokemonGender })}
              />
            </div>
          </Col>

          {/* Forma (se houver formas alternativas) */}
          {options.forms.length > 0 && (
            <Col xs={24} sm={12}>
              <div className="editor-field-item">
                <span className="editor-field-label">{t('editor.fields.form', 'Forma')}</span>
                <ChoiceSelect
                  label={t('editor.fields.form', 'Forma')}
                  choices={options.forms}
                  value={details.form}
                  onChange={(form) => submit({ form })}
                />
              </div>
            </Col>
          )}

          {/* Características Especiais: Shiny e Alpha */}
          <Col xs={24} sm={12}>
            <div className="editor-field-item">
              <span className="editor-field-label">{t('editor.fields.characteristics', 'Características Especiais')}</span>
              <div style={{ minHeight: 32, display: 'flex', alignItems: 'center' }}>
                <Space size={12} wrap align="center">
                  <Tag
                    color={details.isShiny ? 'gold' : 'default'}
                    style={{ fontSize: '13px', padding: '2px 8px', margin: 0 }}
                  >
                    {details.isShiny ? '✨ Shiny' : 'Normal'}
                  </Tag>
                  {details.isAlpha !== null && (
                    <Space size={6} align="center">
                      <span style={{ fontSize: 13 }}>{t('editor.fields.alpha', 'Alpha')}:</span>
                      <Switch
                        aria-label={t('editor.fields.alpha', 'Alpha')}
                        checked={details.isAlpha}
                        onChange={(isAlpha: boolean) => submit({ isAlpha })}
                      />
                    </Space>
                  )}
                </Space>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Seção 2: Treinamento & Parâmetros de Combate */}
      <Card
        size="small"
        title={
          <Space size={8}>
            <ThunderboltOutlined style={{ color: '#faad14' }} />
            <span>{t('editor.sections.training', 'Treinamento & Atributos')}</span>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {/* Nível & EXP */}
          <Col xs={24} sm={12}>
            <div className="editor-field-item">
              <span className="editor-field-label">{t('editor.fields.level', 'Nível')}</span>
              <Space wrap align="center">
                <InputNumber
                  aria-label={t('editor.fields.level', 'Nível')}
                  min={1}
                  max={100}
                  value={details.level}
                  onChange={(level) => level !== null && submit({ level })}
                />
                <Button type="link" size="small" onClick={() => setEditingExperience(true)}>
                  {t('editor.fields.editExp', 'Editar EXP')}
                </Button>
              </Space>
            </div>
          </Col>

          {/* Natureza (Invisível no primeiro momento, visível apenas se o usuário clicar no seletor) */}
          {natures.length > 0 && (
            <Col xs={24} sm={12}>
              <div className="editor-field-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="editor-field-label">{t('editor.fields.nature', 'Natureza')}</span>
                  <Button
                    type="text"
                    size="small"
                    icon={<InfoCircleOutlined style={{ color: natureInfoVisible ? '#1677ff' : '#8c8c8c', fontSize: 13 }} />}
                    onClick={() => setNatureInfoVisible((prev) => !prev)}
                    title={t('editor.fields.toggleNatureInfo', 'Ver efeito da natureza')}
                    style={{ padding: '0 4px', height: 20 }}
                  />
                </div>
                <NatureSelect
                  label={t('editor.fields.nature', 'Natureza')}
                  choices={natures}
                  value={details.nature}
                  stats={details.stats}
                  disabled={isLocked(options, 'nature')}
                  onChange={(nature) => submit({ nature })}
                  onInteract={() => setNatureInfoVisible(true)}
                />
                {natureInfoVisible && (
                  <div style={{ marginTop: 6 }}>
                    <Tag
                      color={
                        natureInfo.isNeutral
                          ? 'default'
                          : natureSuitable
                            ? 'blue'
                            : 'warning'
                      }
                      style={{
                        margin: 0,
                        padding: '4px 8px',
                        fontSize: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <span>{getNatureDescription(details.nature, t)}</span>
                      <span
                        style={{ cursor: 'pointer', marginLeft: 8, fontWeight: 'bold' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setNatureInfoVisible(false)
                        }}
                        title={t('common.close', 'Fechar')}
                      >
                        ✕
                      </span>
                    </Tag>
                  </div>
                )}
              </div>
            </Col>
          )}

          {/* Item Segurado */}
          {options.heldItems.length > 1 && (
            <Col xs={24} sm={12}>
              <div className="editor-field-item">
                <span className="editor-field-label">{t('editor.fields.heldItem', 'Item Segurado')}</span>
                <ItemSelect
                  items={options.heldItems}
                  label={t('editor.fields.heldItem', 'Item Segurado')}
                  value={details.heldItem}
                  onChange={(item) => submit({ heldItem: item.id })}
                />
              </div>
            </Col>
          )}

          {/* Habilidade */}
          {options.abilities.length > 0 && (
            <Col xs={24} sm={12}>
              <div className="editor-field-item">
                <span className="editor-field-label">{t('editor.fields.ability', 'Habilidade')}</span>
                <ChoiceSelect
                  label={t('editor.fields.ability', 'Habilidade')}
                  choices={options.abilities}
                  value={details.ability}
                  disabled={isLocked(options, 'ability')}
                  onChange={(ability) => submit({ ability })}
                />
              </div>
            </Col>
          )}

          {/* Pokébola */}
          {balls.length > 0 && (
            <Col xs={24} sm={12}>
              <div className="editor-field-item">
                <span className="editor-field-label">{t('editor.fields.ball', 'Pokébola')}</span>
                <ItemSelect
                  items={balls}
                  label={t('editor.fields.ball', 'Pokébola')}
                  value={details.ball}
                  onChange={(ball) => submit({ ball: ball.id })}
                />
              </div>
            </Col>
          )}

          {/* Amizade / Contador de Choco */}
          <Col xs={24} sm={12}>
            <div className="editor-field-item">
              <span className="editor-field-label">
                {details.isEgg
                  ? t('editor.fields.hatchCounter', 'Contador de Choco')
                  : t('editor.fields.friendship', 'Amizade')}
              </span>
              <InputNumber
                aria-label={
                  details.isEgg
                    ? t('editor.fields.hatchCounter', 'Contador de Choco')
                    : t('editor.fields.friendship', 'Amizade')
                }
                min={0}
                max={255}
                value={details.friendship}
                onChange={(friendship) => friendship !== null && submit({ friendship })}
              />
            </div>
          </Col>
        </Row>
      </Card>

      {/* Seção 3: Sistema & Estado */}
      <Card
        size="small"
        title={
          <Space size={8}>
            <SlidersOutlined style={{ color: '#52c41a' }} />
            <span>{t('editor.sections.system', 'Sistema & Estado')}</span>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          {/* PID */}
          <Col xs={24} sm={12}>
            <div className="editor-field-item">
              <span className="editor-field-label">PID</span>
              <div
                style={{
                  minHeight: 32,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 11px',
                  borderRadius: 6,
                  border: '1px solid var(--ant-color-border, #d9d9d9)',
                }}
              >
                <Typography.Text copyable style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                  {details.pid.toString(16).toUpperCase().padStart(8, '0')}
                </Typography.Text>
              </div>
            </div>
          </Col>

          {/* Idioma */}
          {languages.length > 0 && (
            <Col xs={24} sm={12}>
              <div className="editor-field-item">
                <span className="editor-field-label">{t('editor.fields.language', 'Idioma')}</span>
                <ChoiceSelect
                  label={t('editor.fields.language', 'Idioma')}
                  choices={languages}
                  value={details.language}
                  onChange={(language) => submit({ language })}
                />
              </div>
            </Col>
          )}

          {/* Condições Especiais: Ovo, Infectado e Curado */}
          <Col xs={24}>
            <div className="editor-field-item">
              <span className="editor-field-label">{t('common.status', 'Condições Especiais')}</span>
              <Space size={24} wrap align="center">
                <Space size={8} align="center">
                  <span style={{ fontSize: 13 }}>{t('editor.fields.egg', 'Ovo')}:</span>
                  <Switch
                    aria-label={t('editor.fields.egg', 'Ovo')}
                    checked={details.isEgg}
                    onChange={(isEgg) => submit({ isEgg })}
                  />
                </Space>
                <Space size={8} align="center">
                  <span style={{ fontSize: 13 }}>{t('editor.fields.infected', 'Infectado')}:</span>
                  <Switch
                    aria-label={t('editor.fields.infected', 'Infectado')}
                    disabled
                    checked={details.isInfected}
                  />
                </Space>
                <Space size={8} align="center">
                  <span style={{ fontSize: 13 }}>{t('editor.fields.cured', 'Curado')}:</span>
                  <Switch
                    aria-label={t('editor.fields.cured', 'Curado')}
                    disabled
                    checked={details.isCured}
                  />
                </Space>
              </Space>
            </div>
          </Col>
        </Row>
      </Card>

      {editingExperience && <ExperienceModal onClose={() => setEditingExperience(false)} />}
    </Flex>
  )
}
