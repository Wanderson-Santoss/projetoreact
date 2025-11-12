import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
// Importação de Ícones (Adicionados: Wrench, HandCoins, Upload, Image, Video)
import { Send, FileText, DollarSign, Calendar, MapPin, Zap, X, Wrench, HandCoins, Upload, Image, Video } from 'lucide-react'; 

// URL base para demandas (use o axiosConfig se estiver configurado)
const DEMANDS_API_URL = '/api/v1/demandas/';

// Mapeamento de nomes de serviço para ícones (Reutilizando a ideia do ProfileManagement)
const CATEGORY_ICON_MAP = {
    'Eletricidade': Zap,
    'Pintura': Wrench,
    'Hidráulica': HandCoins, 
    'Outros': Send,
    'Limpeza': Wrench,
    'Alvenaria': Wrench,
};
// Lista de serviços para o Select (se for demanda geral)
const SERVICE_OPTIONS = ['Eletricidade', 'Pintura', 'Hidráulica', 'Alvenaria', 'Limpeza', 'Outros'];


const CreateDemand = ({ isEditing = false }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();
    
    const professionalData = location.state?.professional || null;
    
    // --- ESTADOS DO FORMULÁRIO E AUXILIARES ---
    const [formData, setFormData] = useState({
        profissional_id: professionalData?.id || '',
        titulo: '',
        descricao: '',
        tipo_servico: professionalData?.servico_principal || (SERVICE_OPTIONS[0] || ''),
        data_limite: '', // Agora opcional
        localizacao: professionalData?.localizacao || '',
        orcamento_estimado: '',
    });

    const [cep, setCep] = useState('');
    const [locationDisplay, setLocationDisplay] = useState(professionalData?.localizacao || ''); // Mostra a localização formatada
    const [loading, setLoading] = useState(false);
    const [loadingCep, setLoadingCep] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [attachments, setAttachments] = useState({ // Novo estado para anexos
        photos: null,
        videos: null,
    });
    
    const pageTitle = isEditing ? 'Editar Demanda' : (professionalData ? 'Solicitar Serviço (Profissional Específico)' : 'Criar Nova Demanda (Geral)');
    const submitButtonText = isEditing ? 'Salvar Edição' : 'Criar Demanda';

    // --- LÓGICA DE BUSCA POR CEP (SIMULAÇÃO) ---
    const fetchAddressByCep = async (cepValue) => {
        // Formato CEP sem formatação: 8 dígitos
        if (cepValue.length !== 8) return; 

        setLoadingCep(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 800)); // Simula API call

        let fetchedData = null;
        if (cepValue.startsWith('242')) { // Exemplo para Niterói
            fetchedData = { localidade: 'Niterói', uf: 'RJ' };
        } else if (cepValue.startsWith('010')) { // Exemplo para São Paulo
            fetchedData = { localidade: 'São Paulo', uf: 'SP' };
        } else {
             fetchedData = { localidade: 'Rio de Janeiro', uf: 'RJ' };
        }

        setLoadingCep(false);
        
        if (fetchedData && fetchedData.localidade) {
            const fullLocation = `${fetchedData.localidade}, ${fetchedData.uf}`;
            setLocationDisplay(fullLocation);
            setFormData(prev => ({ ...prev, localizacao: fullLocation }));
        } else {
            setLocationDisplay('CEP não encontrado. Digite a localização manualmente.');
            setFormData(prev => ({ ...prev, localizacao: '' }));
        }
    };

    const handleCepChange = (e) => {
        // Limita a 8 dígitos (apenas números)
        const value = e.target.value.replace(/\D/g, '').substring(0, 8); 
        setCep(value);
        if (value.length === 8) {
            fetchAddressByCep(value);
        } else {
            setLocationDisplay('');
            setFormData(prev => ({ ...prev, localizacao: '' }));
        }
    };

    // --- LÓGICA DE EDIÇÃO ---
    const fetchDemandData = useCallback(async (demandId) => {
        setLoading(true);
        try {
            // Lógica real: const response = await axios.get(`${DEMANDS_API_URL}${demandId}/`);
            // Simulação de dados de edição
            await new Promise(resolve => setTimeout(resolve, 500)); 
            const mockData = {
                profissional_id: 123,
                titulo: `Edição: Eletricista para conserto de tomada ${demandId}`,
                descricao: 'O disjuntor continua caindo. Precisa de reparo urgente na rede da cozinha.',
                tipo_servico: 'Eletricidade', 
                data_limite: '2025-12-01',
                localizacao: 'Niterói, RJ',
                orcamento_estimado: '400',
                id: demandId,
            };
            setFormData(mockData);
            setLocationDisplay(mockData.localizacao);
        } catch (err) {
            console.error("Erro ao buscar dados da demanda:", err.response || err);
            setError('Não foi possível carregar os dados da demanda para edição.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isEditing && id) {
            fetchDemandData(id);
        }
    }, [isEditing, id, fetchDemandData]);

    // --- HANDLERS GERAIS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setAttachments(prev => ({
            ...prev,
            [name]: files[0] // Assume single file upload per field
        }));
    };
    
    const handleGoBack = () => {
        navigate('/meu-perfil');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            // Lógica para preparar o objeto de envio (sem anexos aqui, mas a estrutura está pronta)
            const dataToSend = { ...formData };
            if (!dataToSend.profissional_id) {
                delete dataToSend.profissional_id; 
            }
            if (!dataToSend.data_limite) {
                delete dataToSend.data_limite; 
            }
            
            // Simulação de chamada de API
            await new Promise(resolve => setTimeout(resolve, 1500)); 

            setSuccess(isEditing ? 'Demanda atualizada com sucesso!' : 'Sua solicitação de serviço foi criada com sucesso! Você será redirecionado para a tela de gerenciamento de demandas em breve.');
            
            setTimeout(() => {
                navigate('/meu-perfil');
            }, 3000);

        } catch (err) {
            console.error("Erro ao processar demanda:", err.response || err);
            setError('Não foi possível processar sua solicitação. Verifique os dados e tente novamente.');
        } finally {
            setLoading(false);
        }
    };
    
    if (isEditing && loading && !error) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="warning" role="status" />
                <p className='text-light mt-2'>Carregando dados da demanda...</p>
            </Container>
        );
    }
    
    const ServiceIcon = CATEGORY_ICON_MAP[formData.tipo_servico] || Zap; // Icone dinâmico

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col md={8} lg={7}>
                    <Card className="bg-vagali-dark-card p-4 shadow-lg">
                        <h2 className="text-center mb-4 fw-bold" style={{ color: 'var(--light-bg)' }}>
                            <Send size={24} className="me-2" style={{ color: 'var(--primary-color)' }} /> 
                            {pageTitle}
                        </h2>

                        {/* Alerta de Demanda Específica/Geral */}
                        {professionalData ? (
                            <Alert variant="info" className="mb-3 text-center small p-2" style={{ backgroundColor: 'var(--accent-color)', color: 'var(--dark-text)', borderColor: 'var(--accent-color)' }}>
                                <strong className="text-white">DEMANDA ESPECÍFICA:</strong> Você está solicitando o serviço para <strong className="text-dark">{professionalData.full_name}</strong>.
                                <Form.Control type="hidden" name="profissional_id" value={formData.profissional_id} />
                            </Alert>
                        ) : !isEditing && (
                            <Alert variant="secondary" className="mb-3 text-center small p-2" style={{ backgroundColor: '#555', color: 'var(--light-bg)', borderColor: '#555' }}>
                                <strong style={{ color: 'var(--accent-color)' }}>DEMANDA GERAL:</strong> Esta solicitação ficará visível para **vários profissionais** na sua região.
                            </Alert>
                        )}
                        
                        {error && <Alert variant="danger">{error}</Alert>}
                        {success && <Alert variant="success">{success}</Alert>}
                        
                        <Form onSubmit={handleSubmit}>
                            
                            {/* Título da Demanda */}
                            <Form.Group className="mb-3" controlId="formTitulo">
                                <Form.Label className='fw-bold' style={{ color: 'var(--light-bg)' }}><FileText size={16} className="me-1" /> Título (Resumo do Serviço)</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    className="form-control-dark"
                                    placeholder="Ex: Instalação de Ventilador de Teto"
                                    required
                                />
                            </Form.Group>
                            
                            {/* Descrição */}
                            <Form.Group className="mb-3" controlId="formDescricao">
                                <Form.Label className='fw-bold' style={{ color: 'var(--light-bg)' }}>Descrição Detalhada</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={4}
                                    name="descricao"
                                    value={formData.descricao}
                                    onChange={handleChange}
                                    className="form-control-dark"
                                    placeholder="Descreva o que precisa ser feito. Seja detalhado, inclua tipo de material, cores, ou o problema exato."
                                    required
                                />
                            </Form.Group>
                            
                            <Row>
                                {/* Tipo de Serviço */}
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="formTipoServico">
                                        <Form.Label className='fw-bold' style={{ color: 'var(--light-bg)' }}><ServiceIcon size={16} className="me-1" /> Tipo de Serviço</Form.Label>
                                        {professionalData ? (
                                            // Se o profissional for pré-selecionado, mostra o serviço dele como read-only
                                            <Form.Control
                                                type="text"
                                                value={formData.tipo_servico}
                                                className="form-control-dark"
                                                readOnly
                                            />
                                        ) : (
                                            // Se for demanda geral, permite selecionar
                                            <Form.Select
                                                name="tipo_servico"
                                                value={formData.tipo_servico}
                                                onChange={handleChange}
                                                className="form-control-dark"
                                                required
                                            >
                                                {SERVICE_OPTIONS.map(service => (
                                                    <option key={service} value={service}>{service}</option>
                                                ))}
                                            </Form.Select>
                                        )}
                                    </Form.Group>
                                </Col>
                                {/* Orçamento Estimado */}
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="formOrcamento">
                                        <Form.Label className='fw-bold' style={{ color: 'var(--light-bg)' }}><DollarSign size={16} className="me-1" /> Orçamento Máximo (R$)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            name="orcamento_estimado"
                                            value={formData.orcamento_estimado}
                                            onChange={handleChange}
                                            className="form-control-dark"
                                            placeholder="Ex: 500.00 (opcional)"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row>
                                {/* CEP para Localização */}
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="formCep">
                                        <Form.Label className='fw-bold' style={{ color: 'var(--light-bg)' }}><MapPin size={16} className="me-1" /> CEP (Busca Localização)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="cep"
                                            value={cep}
                                            onChange={handleCepChange}
                                            className="form-control-dark"
                                            placeholder="Apenas números (Ex: 24230000)"
                                            maxLength={8}
                                        />
                                        {loadingCep && <Spinner animation="border" size="sm" variant="warning" className="ms-2 mt-1" />}
                                    </Form.Group>
                                </Col>
                                {/* Localização (Preenchida pelo CEP ou Manualmente) */}
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="formLocalizacao">
                                        <Form.Label className='fw-bold' style={{ color: 'var(--light-bg)' }}>Localização (Cidade/UF)</Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="localizacao"
                                            value={locationDisplay} // Usa o estado de exibição que é preenchido pelo CEP
                                            onChange={(e) => { 
                                                setLocationDisplay(e.target.value);
                                                handleChange(e); // Atualiza o formData
                                            }}
                                            className="form-control-dark"
                                            placeholder="Ex: Niterói, RJ"
                                            required
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            <Row>
                                {/* Data Limite (Opcional) */}
                                <Col md={6}>
                                    <Form.Group className="mb-3" controlId="formDate">
                                        <Form.Label className='fw-bold' style={{ color: 'var(--light-bg)' }}><Calendar size={16} className="me-1" /> Data Limite (Previsão - Opcional)</Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="data_limite"
                                            value={formData.data_limite}
                                            onChange={handleChange}
                                            className="form-control-dark"
                                        />
                                    </Form.Group>
                                </Col>

                                {/* ANEXO: FOTOS */}
                                <Col md={6}>
                                    <Form.Group controlId="formPhotos" className="mb-3">
                                        <Form.Label className='fw-bold' style={{ color: 'var(--light-bg)' }}><Image size={16} className="me-1" /> Fotos (Opcional)</Form.Label>
                                        <Form.Control 
                                            type="file" 
                                            name="photos"
                                            onChange={handleFileChange}
                                            className="form-control-dark" 
                                            accept="image/*"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            
                            {/* ANEXO: VÍDEO (Em uma linha separada para maior destaque) */}
                            <Form.Group controlId="formVideos" className="mb-3">
                                <Form.Label className='fw-bold' style={{ color: 'var(--light-bg)' }}><Video size={16} className="me-1" /> Vídeo (Opcional)</Form.Label>
                                <Form.Control 
                                    type="file" 
                                    name="videos"
                                    onChange={handleFileChange}
                                    className="form-control-dark" 
                                    accept="video/*"
                                />
                                <Form.Text muted style={{ color: 'var(--light-text)' }}>
                                    Um vídeo pode ajudar o profissional a entender melhor o serviço.
                                </Form.Text>
                            </Form.Group>

                            {/* Botões de Ação */}
                            <div className="d-flex justify-content-between gap-3 mt-4">
                                <Button 
                                    variant="secondary" 
                                    onClick={handleGoBack}
                                    className="flex-grow-1"
                                    disabled={loading}
                                >
                                    <X size={18} className="me-1" />
                                    Cancelar
                                </Button>
                                
                                <Button 
                                    variant="warning" 
                                    type="submit" 
                                    className="flex-grow-1 fw-bold text-dark" 
                                    disabled={loading}
                                    style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)' }}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner animation="border" size="sm" className="me-2" />
                                            Processando...
                                        </>
                                    ) : (
                                        submitButtonText
                                    )}
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateDemand;