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
import { useAuth } from '@/hooks/useAuth';
import { DataRule } from '../rule';

interface DataUserSite {
    idUserSite?: number;
    name: string ;
    login: string;
    locked: boolean;
    birthday: string ;
    gender: string ;
    phone: string;
    mobile: string;
    cpf: string 
}

const schema = yup.object().shape({
    name: yup.string().required("O Nome não pode estar em branco."),
    login: yup.string().required("O Login não pode estar em branco."),
    locked: yup.boolean(),
    birthday: yup.string().notRequired(),
    gender: yup.string().notRequired(),
    phone: yup.string().notRequired(),
    mobile: yup.string().required("O Celular não pode estar em branco."),
    cpf: yup.string().required("O CPF não pode estar em branco.")
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
  const [usersSite, setUsersSite] =React.useState<DataUserSite[]>([])
  const [userSite, setUserSite] =React.useState<DataUserSite>({
    idUserSite: 0,
    name: '' ,
    login: '',
    locked: false,
    birthday: '',
    gender: '',
    phone: '',
    mobile: '',
    cpf: ''
  })
  const [total, setTotal] = React.useState(0);
 
  const auth = useAuth()

  const defaultValues = {
    name: userSite.name,
    login: userSite.login,
    locked: userSite.locked,
    birthday: userSite.birthday,
    gender: userSite.gender,
    phone: userSite.phone,
    mobile: userSite.mobile,
    cpf: userSite.cpf
    
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
            name: userSite.name,
            login: userSite.login,
            locked: userSite.locked,
            birthday: userSite.birthday,
            gender: userSite.gender,
            phone: userSite.phone,
            mobile: userSite.mobile,
            cpf: userSite.cpf
    
        })
    },[userSite])

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
//função que muda a página das listagens de produtos


  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
//função que estabele quantos produtos serão listados na pagina


  const handleEdit = (userSiteParameter: DataUserSite) => {
    //função que abre o Dialog de criação / edição de cadastros
    setUserSite(userSiteParameter)
    setOpen(true)
  };

  const handleDelete = async (userSiteParameter: DataUserSite) => {
    try{
        await http.delete(`service-user/user-site/${userSiteParameter.idUserSite}`)
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

        let modifiedUserSite={...userSite,...data}

      setUserSite(modifiedUserSite)
  
      if(modifiedUserSite.idUserSite){ //UPDATE
        await http.patch(`service-user/user-site/${modifiedUserSite.idUserSite}`,modifiedUserSite)
        setSnackMessage("Registro atualizado com sucesso.")
      }
      else{ //INSERT
        await http.post(`service-user/user-site/`,modifiedUserSite)
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
            const response = await http.post('service-user/user-site/list', {
                name: search,
                items: rowsPerPage,
                page: page+1,
                order: {name:"ASC"}
            })
            if(response.data.data?.result){
                if(Array.isArray(response.data.data.result)){
                    setUsersSite(response.data.data.result)
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
                    
                </Grid>
            </Grid>
            <Grid item xs={12}>
                
                <TableContainer sx={{ maxHeight: 340 }}>
                    <Table stickyHeader size='small' aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            <TableCell
                                key={'staff'}
                                align={'left'}
                                style={{ minWidth: 200 }}
                            >
                                Nome
                            </TableCell>

                            <TableCell
                                key={'login'}
                                align={'left'}
                                style={{ minWidth: 200 }}
                            >
                                Login
                            </TableCell>
                                                        
                            <TableCell
                                key={'bloqueado'}
                                align={'center'}
                                style={{ maxWidth: 80 }}
                            >
                                Bloqueado
                            </TableCell>

                            <TableCell
                                key={'aniversario'}
                                align={'left'}
                                style={{ minWidth: 200 }}
                            >
                                Aniversário
                            </TableCell>
                            <TableCell
                                key={'genero'}
                                align={'left'}
                                style={{ minWidth: 200 }}
                            >
                                Gênero
                            </TableCell>

                                                                           
                            <TableCell
                                key={'celular'}
                                align={'right'}
                                style={{ minWidth: 100 }}
                            >
                                Celular
                            </TableCell>

                            <TableCell
                                key={'cpf'}
                                align={'right'}
                                style={{ minWidth: 100 }}
                            >
                                Cpf
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
                            usersSite.map((userSite, index) => (
                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                    
                                    <TableCell
                                        key={'staff'}
                                        align={'left'}
                                        style={{ minWidth: 200 }}
                                    >
                                        {userSite.name}
                                    </TableCell>


                                    <TableCell
                                        key={'login'}
                                        align={'left'}
                                        style={{ minWidth: 200 }}
                                    >
                                        {userSite.login}
                                    </TableCell>
                                
                                    
                                    <TableCell
                                        key={'bloqueado'}
                                        align={'center'}
                                        style={{ maxWidth: 80 }}
                                    >
                                        <Checkbox disabled checked={userSite.locked} />
                                    
                                        
                                    </TableCell>

                                    <TableCell
                                        key={'aniversario'}
                                        align={'left'}
                                        style={{ minWidth: 100 }}
                                    >
                                        {userSite.birthday}
                                    </TableCell>

                                    <TableCell
                                        key={'genero'}
                                        align={'left'}
                                        style={{ minWidth: 200 }}
                                    >
                                        {userSite.gender}
                                    </TableCell>

                                    
                                    <TableCell
                                        key={'celular'}
                                        align={'right'}
                                        style={{ minWidth: 100 }}
                                    >
                                        {userSite.mobile}
                                    </TableCell>
                                    <TableCell
                                        key={'cpf'}
                                        align={'right'}
                                        style={{ minWidth: 100 }}
                                    >
                                        {userSite.cpf}
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
                                                    idUserSite: userSite.idUserSite,
                                                    name: userSite.name,
                                                    login: userSite.login,
                                                    locked: userSite.locked,
                                                    birthday: userSite.birthday,
                                                    gender: userSite.gender,
                                                    phone: userSite.phone,
                                                    mobile: userSite.mobile,
                                                    cpf: userSite.cpf
                                                  })}
                                            /> &nbsp;     
                                            { auth.rules?.find(rule => rule?.description == 'Excluir Usuários') || auth.groupAdmin ?                                        
                                            <DeleteIcon 
                                                fontSize='medium' 
                                                sx={{cursor:'pointer'}}
                                                onClick={() =>handleDelete({
                                                    idUserSite: userSite.idUserSite,
                                                    name: userSite.name,
                                                    login: userSite.login,
                                                    locked: userSite.locked,
                                                    birthday: userSite.birthday,
                                                    gender: userSite.gender,
                                                    phone: userSite.phone,
                                                    mobile: userSite.mobile,
                                                    cpf: userSite.cpf
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
                                        label='Nome'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.name)}
                                        placeholder='Nome'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='login'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Login'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.login)}
                                        placeholder='Login'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.login && <FormHelperText sx={{ color: 'error.main' }}>{errors.login.message}</FormHelperText>}
                        </FormControl>
                        
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='birthday'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Aniversário'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.birthday)}
                                        placeholder='Aniversário'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.birthday && <FormHelperText sx={{ color: 'error.main' }}>{errors.birthday.message}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='gender'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Gênero'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.gender)}
                                        placeholder='Gênero'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.gender && <FormHelperText sx={{ color: 'error.main' }}>{errors.gender.message}</FormHelperText>}
                        </FormControl>
                        
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='phone'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Telefone'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.phone)}
                                        placeholder='Telefone'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.phone && <FormHelperText sx={{ color: 'error.main' }}>{errors.phone.message}</FormHelperText>}
                        </FormControl>
                                        
                    
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='cpf'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='CPF'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.cpf)}
                                        placeholder='CPF'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.cpf && <FormHelperText sx={{ color: 'error.main' }}>{errors.cpf.message}</FormHelperText>}
                        </FormControl>

                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='mobile'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Celular'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.mobile)}
                                        placeholder='Celular'
                                        inputProps={{ maxLength: 100 }}
                                    />
                                )}
                            />
                            {errors.mobile && <FormHelperText sx={{ color: 'error.main' }}>{errors.mobile.message}</FormHelperText>}
                        </FormControl>

                    </Grid>
                    <Grid item xs={12} sm={6}>

                        
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='locked'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange} }) => (
                                        <FormControlLabel
                                            control={<Switch checked={value} onChange={onChange} />}
                                            label="Bloqueado"
                                        />
                                )}
                            />
                            {errors.locked && <FormHelperText sx={{ color: 'error.main' }}>{errors.locked.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>

                    </Grid>
                </Grid>
            
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'center' }}>
            <Button type='submit' variant='contained' sx={{ mr: 1, mt:3 }}>
                { saving ? 

                    <CircularProgress size={20} color="inherit" />
                    :
                    'Salvar'
                    }  
                </Button>
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