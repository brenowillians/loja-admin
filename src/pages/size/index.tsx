import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Grid';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, FormHelperText, LinearProgress, Switch, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import http from '../../utils/http'
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import { DataRule } from '../rule';
import { useAuth } from '@/hooks/useAuth';

interface DataSize {
    idSize?: number;
    name: string ;
    active: boolean ;
    createdId: number;
    updatedId: number | null;
}

const schema = yup.object().shape({
    name: yup.string().required("O Nome do Banco não pode estar em branco."),
    active: yup.boolean()
})
//yup:controla as ações individuais no formulário de cada função (cada botão de switch, o que for ou não preenchido etc)

export default function StickyHeadTable() {
  //const defaultValues: Data[] = []

  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [snackMessage, setSnackMessage] = React.useState('');
  const [reload, setReload] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState('');
  const [rules, setRules] = React.useState<DataRule[]>([])
  const [sizes, setSizes] =React.useState<DataSize[]>([])
  const [size, setSize] =React.useState<DataSize>({
    idSize:0,
    name: '',
    active: false,
    createdId: 0,
    updatedId: null
  })
  const [total, setTotal] = React.useState(0);
 
  const auth = useAuth()

  const defaultValues = {
    name: size.name,
    active: size.active
    }

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        defaultValues,
        mode:'onSubmit',
        resolver: yupResolver(schema)
    })


    React.useEffect(()=>{
        reset({
            name: size.name,
            active: size.active
        })
    },[size])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
//função que muda a página das listagens de produtos


  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
//função que estabele quantos produtos serão listados na pagina


  const handleEdit = (sizeParameter: DataSize) => {
    //função que abre o Dialog de criação / edição de cadastros
    setSize(sizeParameter)
    setOpen(true)
  };

  const handleDelete = async (sizeParameter: DataSize) => {
    try{
        await http.delete(`service-product/size/${sizeParameter.idSize}`)
        setReload(!reload)
        setSnackMessage("Registro excluído com sucesso.")
    }
    catch(error){
        console.log(error);
        setSnackMessage("Não foi possível excluir o Tamanho")
    }

  };

  const handleChangeSearch = (event: any) => {
    const { target: { name, value } } = event;
    setSearch(value )
    if(!value){
        makeSearch()
    }
  }
//função que atualiza a busca de acordo com o que foi digitado pelo usuário


  const makeSearch = () =>{
    if(page==0){
        setReload(!reload)
    }
    else{
        setPage(0) 
    }
    
  }

  //função que de fato faz a busca pelo clique ou o pressionar da tecla enter


  const handleKeyDownSearch = (event: any) => {
    if (event.key === 'Enter') {
        makeSearch()
    }
    //função responsável por ativar a ação de buscar, acionada ao pressionar o tecla Enter do teclado
  }

  const onSubmit =  async(data: any) =>{
    setSaving(true)
    try{

        let modifiedSize={...size,...data}

      setSize(modifiedSize)
  
      if(modifiedSize.idSize){ //UPDATE
        await http.patch(`service-product/size/${modifiedSize.idSize}`,modifiedSize)
        setSnackMessage("Registro atualizado com sucesso.")
      }
      else{ //INSERT
        await http.post(`service-product/size/`,modifiedSize)
        setSnackMessage("Registro criado com sucesso.")
      }
      setOpen(false)
      setReload(!reload)
    }
    catch(error){
      console.log(error)
      setSnackMessage("Não foi possível processar a solicitação.")
    }
    setSaving(false)
  }
  //função que faz subir e registrar o tamanho, seja criando uma nova, seja editando uma já criada.

  React.useEffect (()=>{
    const loadData = async () =>{
        setLoading(true)
        try{
            console.log('load')
            const response = await http.post('service-product/size/list', {
                name: search,
                items: rowsPerPage,
                page: page+1,
                order: {name:"ASC"}
            })
            if(response.data.data?.result){
                if(Array.isArray(response.data.data.result)){
                    setSizes(response.data.data.result)
                    setTotal(response.data.data.total)
                }
                else{
                    setSnackMessage("Nenhum registro foi encontrado.")
                }
            }
            else{
                setSnackMessage("Nenhum registro foi encontrado.") 
            }

        }
        catch(error){
            console.log(error)
            setSnackMessage("Não foi possível processar a solicitação.")
        }
        setLoading(false)
    }
    loadData()
  },[page, reload])

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        { loading &&
            <Box sx={{ width: '100%' }}>
              <LinearProgress color="secondary" />
            </Box> 
        }
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Grid container padding={2} spacing={2}>
                    <Grid item xs={10}>                           
                        <TextField id="search" onKeyDown={handleKeyDownSearch} onChange={handleChangeSearch} placeholder='buscar' size="small" variant="outlined" />
                                                
                        <SearchIcon 
                            fontSize='medium' 
                            sx={{cursor:'pointer'}}
                            onClick={() => {
                                setReload(!reload)
                            }}
                        />

                        
                    </Grid>
                    { auth.rules?.find(rule => rule?.description == 'Adicionar Tamanhos') || auth.groupAdmin ?
                    <Grid item xs={2}>
                        <Button type='submit' 
                            onClick={() =>handleEdit({
                                name: '',
                                active: false,
                                createdId: 0,
                                updatedId: null
                              })} 
                            variant='contained' 
                            sx={{ mr: 1, mt:3 }}
                        >
                            Adicionar
                        </Button>
                    </Grid>
                    :null}
                </Grid>
            </Grid>
            <Grid item xs={12}>
                
                <TableContainer sx={{ maxHeight: 340 }}>
                    <Table stickyHeader size='small' aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                key={'descricao'}
                                align={'left'}
                                style={{ minWidth: 200 }}
                            >
                                Tamanho do Produto
                            </TableCell>

                            <TableCell
                                key={'ativo'}
                                align={'center'}
                                style={{ maxWidth: 80 }}
                            >
                                Ativo
                            </TableCell>

                            <TableCell
                                key={'acoes'}
                                align={'right'}
                                style={{ minWidth: 100 }}
                            >
                                Ações
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            sizes.map((size, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                    
                                    <TableCell
                                        key={'descricao'}
                                        align={'left'}
                                        style={{ minWidth: 200 }}
                                    >
                                        {size.name}
                                    </TableCell>
                                    <TableCell
                                        key={'ativo'}
                                        align={'center'}
                                        style={{ maxWidth: 80 }}
                                    >
                                        <Checkbox disabled checked={size.active} />
                                    
                                        
                                    </TableCell>
                                    <TableCell
                                        key={'createdDate'}
                                        align={'right'}
                                        style={{ minWidth: 100 }}
                                    >
                                            <SearchIcon 
                                                fontSize='medium' 
                                                sx={{cursor:'pointer'}}
                                                onClick={() =>handleEdit({
                                                    idSize: size.idSize,
                                                    name: size.name,
                                                    active: size.active,
                                                    createdId: 0,
                                                    updatedId: null
                                                  })}
                                            /> &nbsp;    
                                            { auth.rules?.find(rule => rule?.description == 'Excluir Tamanhos') || auth.groupAdmin ?                                         
                                            <DeleteIcon 
                                                fontSize='medium' 
                                                sx={{cursor:'pointer'}}
                                                onClick={() =>handleDelete({
                                                    idSize: size.idSize,
                                                    name: size.name,
                                                    active: size.active,
                                                    createdId: 0,
                                                    updatedId: null
                                                  })}
                                            /> 
                                            :null}
                                    </TableCell>
                                </TableRow>

                            ))
                        }
                    </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={total}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Grid>
        </Grid>

        <Dialog
            open={open}
            onClose={() =>setOpen(false)}
            aria-labelledby='user-view-edit'
            sx={{ '& .MuiPaper-root': { width: '100%', maxWidth: 650, p: [2, 10] } }}
            aria-describedby='user-view-edit-description'
        >
            <form  autoComplete='off' onSubmit={handleSubmit(onSubmit)}>              
            <DialogContent>
                <Grid container spacing={6}>
                
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='name'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Tipos de Tamanho'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.name)}
                                        placeholder='Tipos de Tamanho'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
                        </FormControl>

                    </Grid>
                    <Grid item xs={12} sm={6}>

                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='active'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange} }) => (
                                        <FormControlLabel
                                            control={<Switch checked={value} onChange={onChange} />}
                                            label="Ativo"
                                        />
                                )}
                            />
                            {errors.active && <FormHelperText sx={{ color: 'error.main' }}>{errors.active.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>

                    </Grid>
                </Grid>
            
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
            { auth.rules?.find(rule => rule?.description == 'Salvar') || auth.groupAdmin ?
            <Button type='submit' variant='contained' sx={{ mr: 1, mt:3 }}>
                { saving ? 

                    <CircularProgress size={20} color="inherit" />
                    :
                    'Salvar'
                    }  
                </Button>
                :null}
                <Button variant='outlined' sx={{ mr: 1, mt:3 }} color='secondary' onClick={() =>setOpen(false)}>
                    Fechar
                </Button>
            </DialogActions>
            </form>
        </Dialog> 

        <Snackbar
            anchorOrigin={{  vertical: 'bottom', horizontal: 'left' }}
            open={snackMessage!=''}
            onClose={()=> setSnackMessage('')}
            message={snackMessage}
            key={'snack'}
            autoHideDuration={5000}
        />       
    </Paper>
  );
}