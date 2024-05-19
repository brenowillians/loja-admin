import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, Select, Switch, TextField } from "@mui/material";
import React, { Fragment } from "react";
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
//import { DataStaff } from "..";
import http from "@/utils/http";
import { useAuth } from '@/hooks/useAuth';


interface ViewStaffProps {
    open: boolean;
    reload?: boolean;
    staff: DataStaff;
    setSnackMessage?:React.Dispatch<React.SetStateAction<string>>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setReload?: React.Dispatch<React.SetStateAction<boolean>>;
    disableSave?: boolean
}

export interface DataStaff {
    idStaff?: number;
    name: string ;
    login: string;
    id_number: string;
    cpf: string;
    password?: string;
    active: boolean ;
    locked: boolean;
    sector: string;
    role: string;
    ctps: string;
    phone: string;
    mobile: string;
    
}

const schema = yup.object().shape({
    name: yup.string().required("O Nome não pode estar em branco."),
    login: yup.string().required("O Login não pode estar em branco."),
    cpf: yup.string().required("O CPF não pode estar em branco."),
    id_number: yup.string().required("O RG não pode estar em branco."),
    newPassword: yup.string(),
    newPasswordConfirmation: 
      yup.string()
      .oneOf([yup.ref('newPassword')], 'A confirmação da senha está diferente da senha original.'),
    active: yup.boolean(),
    locked: yup.boolean(),
    sector: yup.string().required("O Setor  não pode estar em branco."),
    role: yup.string().required("A Função  não pode estar em branco."),
    ctps: yup.string().nullable(),//.required("A imagem do  não pode estar em branco."),
    phone: yup.string().nullable(),//.required("A imagem do  não pode estar em branco."),
    mobile: yup.string().required("O Celular não pode estar em branco."),
})
//yup:controla as ações individuais no formulário de cada função (cada botão de switch, o que for ou não preenchido etc)

export default function ViewStaffComponent(props: ViewStaffProps) {
    const { open, reload, staff, setSnackMessage, setOpen, setReload, disableSave } = props


    const [saving, setSaving] = React.useState(false);
    const [loading, setLoading] = React.useState(false);

    const auth = useAuth()

    const defaultValues = {
        name: staff.name,
        login: staff.login,
        cpf: staff.cpf,
        id_number: staff.id_number,
        newPassword: '',
        newPasswordConfirmation: '',
        active: staff.active,
        locked: staff.locked,
        sector: staff.sector,
        role: staff.role,
        ctps: staff.ctps??'',
        phone: staff.phone??'',
        mobile: staff.mobile
        
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
            name: staff.name,
            login: staff.login,
            cpf: staff.cpf,
            id_number: staff.id_number,
            newPassword: '',
            newPasswordConfirmation: '',
            active: staff.active,
            locked: staff.locked,
            sector: staff.sector,
            role: staff.role,
            ctps: staff.ctps,
            phone: staff.phone,
            mobile: staff.mobile
        })
    },[staff])

        const onSubmit =  async(data: any) =>{
            setSaving(true)
            try{
        
              let modifiedStaff={...staff,...data}
              if(data.newPassword){
                modifiedStaff.password= data.newPassword
              }
        
              delete modifiedStaff.newPassword
              delete modifiedStaff.newPasswordConfirmation
        
              //setStaff(modifiedStaff)
          
              if(modifiedStaff.idStaff){ //UPDATE
                await http.patch(`service-user/staff/${modifiedStaff.idStaff}`,modifiedStaff)
                setSnackMessage && setSnackMessage("Registro atualizado com sucesso.")
              }
              else{ //INSERT
                await http.post(`service-user/staff/`,modifiedStaff)
                setSnackMessage && setSnackMessage("Registro criado com sucesso.")
              }
        
              setOpen(false)
              setReload && setReload(!reload)
            }
            catch(error){
              console.log(error)
              setSnackMessage && setSnackMessage("Não foi possível processar a solicitação.")
            }
            setSaving(false)
          }
          //função que faz subir e registrar o tamanho, seja criando uma nova, seja editando uma já criada.

          return (
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
                        <FormControl >
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
                                        disabled={disableSave}
                                    />
                                )}
                            />
                            {errors.name && <FormHelperText sx={{ color: 'error.main' }}>{errors.name.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>    

                        <FormControl >
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
                                        disabled={disableSave}
                                    />
                                )}
                            />
                            {errors.login && <FormHelperText sx={{ color: 'error.main' }}>{errors.login.message}</FormHelperText>}
                        </FormControl>
                    </Grid>                
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth >
                            <Controller
                                name='id_number'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='RG'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.id_number)}
                                        placeholder='Login'
                                        inputProps={{ maxLength: 100 }}
                                        disabled={disableSave}
                                    />
                                )}
                            />
                            {errors.id_number && <FormHelperText sx={{ color: 'error.main' }}>{errors.id_number.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>    
                        <FormControl fullWidth >
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
                                        placeholder='Login'
                                        inputProps={{ maxLength: 100 }}
                                        disabled={disableSave}
                                    />
                                )}
                            />
                            {errors.cpf && <FormHelperText sx={{ color: 'error.main' }}>{errors.cpf.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>    
                        
                        <FormControl fullWidth >
                            <Controller
                                name='newPassword'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Senha'
                                        type="password"
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.newPassword)}
                                        placeholder='Senha'
                                        inputProps={{ maxLength: 100 }}
                                        disabled={disableSave}
                                    />
                                )}
                            />
                            {errors.newPassword && <FormHelperText sx={{ color: 'error.main' }}>{errors.newPassword.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>    
                        <FormControl fullWidth >
                            <Controller
                                name='newPasswordConfirmation'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        type="password"
                                        label='Repita a Senha'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.newPasswordConfirmation)}
                                        placeholder='Repita a Senha'
                                        inputProps={{ maxLength: 100 }}
                                        disabled={disableSave}
                                    />
                                )}
                            />
                            {errors.newPasswordConfirmation && <FormHelperText sx={{ color: 'error.main' }}>{errors.newPasswordConfirmation.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>            
                        <FormControl fullWidth >
                            <Controller
                                name='sector'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Setor'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.sector)}
                                        placeholder='Setor'
                                        inputProps={{ maxLength: 100 }}
                                        disabled={disableSave}
                                    />
                                )}
                            />
                            {errors.sector && <FormHelperText sx={{ color: 'error.main' }}>{errors.sector.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>    
                        <FormControl fullWidth >
                            <Controller
                                name='role'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Função'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.role)}
                                        placeholder='Função'
                                        inputProps={{ maxLength: 100 }}
                                        disabled={disableSave}
                                    />
                                )}
                            />
                            {errors.role && <FormHelperText sx={{ color: 'error.main' }}>{errors.role.message}</FormHelperText>}
                        </FormControl>
                    </Grid>    
                    <Grid item xs={12} sm={6}>
                        
                        <FormControl fullWidth >
                            <Controller
                                name='ctps'
                                control={control}
                                render={({ field: { value, onChange, onBlur } }) => (
                                    <TextField
                                        autoFocus
                                        label='Ctps'
                                        value={value}
                                        onBlur={onBlur}
                                        onChange={onChange}
                                        error={Boolean(errors.ctps)}
                                        placeholder='Ctps'
                                        inputProps={{ maxLength: 100 }}
                                        disabled={disableSave}
                                    />
                                )}
                            />
                            {errors.ctps && <FormHelperText sx={{ color: 'error.main' }}>{errors.ctps.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>    
                                        
                    
                        <FormControl fullWidth >
                            <Controller
                                name='phone'
                                control={control}
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
                                        disabled={disableSave}
                                    />
                                )}
                            />
                            {errors.phone && <FormHelperText sx={{ color: 'error.main' }}>{errors.phone.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>    

                        <FormControl fullWidth>
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
                                        disabled={disableSave}
                                    />
                                )}
                            />
                            {errors.mobile && <FormHelperText sx={{ color: 'error.main' }}>{errors.mobile.message}</FormHelperText>}
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
                                            control={<Switch checked={value} disabled={disableSave} onChange={onChange} />}
                                            label="Ativo"
                                        />
                                )}
                            />
                            {errors.active && <FormHelperText sx={{ color: 'error.main' }}>{errors.active.message}</FormHelperText>}
                        </FormControl>
                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='locked'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange} }) => (
                                        <FormControlLabel
                                            control={<Switch checked={value} disabled={disableSave} onChange={onChange} />}
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
            { !disableSave && (auth.rules?.find(rule => rule?.description == 'Salvar') || auth.groupAdmin) ?
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
          )}