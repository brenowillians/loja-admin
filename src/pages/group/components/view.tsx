import { DataGroup } from "..";
import * as yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { Box, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, Select, Switch, TextField } from "@mui/material";
import React, { Fragment } from "react";
import http from "@/utils/http";
import { DataStaff } from "@/pages/staff";
import { DataRule } from "@/pages/rule"

interface ViewGroupProps {
    open: boolean;
    reload: boolean;
    group: DataGroup;
    setSnackMessage:React.Dispatch<React.SetStateAction<string>>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setReload: React.Dispatch<React.SetStateAction<boolean>>;

}


export interface DataGroupStaff {
    idGroupstaff: number;
    idStaff: number;
    idGroup: number;
    createdDate?: string;
    updatedDate?: string;
    deletedDate?: string;
    idGroup2?: DataGroup
}

export interface DataGroupRule{
    idGroupRule: number;
    idGroup: number;
    idRule: number;
    createdDate?: string;
    updatedDate?: string;
    deletedDate?: string;
    idRule2?: DataRule;
}

const schema = yup.object().shape({
    name: yup.string().required("O Nome não pode estar em branco."),
    isAdmin: yup.boolean().required("O campo não pode estar em branco."),
})
//yup:controla as ações individuais no formulário de cada função (cada botão de switch, o que for ou não preenchido etc)

export default function ViewGroupComponent(props: ViewGroupProps) {
    const { open, reload, group, setSnackMessage, setOpen, setReload } = props
    const [isAdmin, setIsAdmin] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [originalGroupStaffs, setOriginalGroupStaffs] =React.useState<DataGroupStaff[]>([])
    const [groupStaffs, setGroupStaffs] =React.useState<DataGroupStaff[]>([])
    const [staffs, setStaffs] =React.useState<DataStaff[]>([])
    const [originalGroupRules, setOriginalGroupRules] = React.useState<DataGroupRule[]>([])
    const [groupRules, setGroupRules] = React.useState<DataGroupRule[]>([])
    const [rules, setRules] = React.useState<DataRule[]>([])

    const defaultValues = {
        name: group.name,
        isAdmin: group.isAdmin
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

    const onSubmit =  async(data: any) =>{
        setSaving(true)
        try{
    
          let modifiedGroup={...group,...data}
    
          //setGroup(modifiedGroup)
      
          
          if(modifiedGroup.idGroup){ //UPDATE
            await http.patch(`service-user/group/${modifiedGroup.idGroup}`,modifiedGroup)

            //Salvamento GroupStaff
            //deletar todos os groupstaffs existentes
            if(originalGroupStaffs.length){
                for(const groupStaff of originalGroupStaffs){
                    await http.delete(`service-user/group-staff/${groupStaff.idGroupstaff}`)
                }
            }
    
            //criar os novos groupstaffs marcados no formulario
            if(groupStaffs.length){
                for(const groupStaff of groupStaffs){
                    await http.post(`service-user/group-staff/`, {
                        idGroup: modifiedGroup.idGroup,
                        idStaff: groupStaff.idStaff,
                    })
                }
            }

            //Salvamento GroupRule
            //deletar todos os groupRules existentes
            if(originalGroupRules.length){
                for(const groupRule of originalGroupRules){
                    await http.delete(`service-user/group-rule/${groupRule.idGroupRule}`)
                }
            }

            //criar os novos groupRules marcados no formulario
            if(groupRules.length){
                for(const groupRule of groupRules){
                    await http.post(`service-user/group-rule/`, {
                        idGroup: modifiedGroup.idGroup,
                        idRule: groupRule.idRule,
                    })
                }
            }
            setSnackMessage("Registro atualizado com sucesso.")
          }
          else{ //INSERT
            const result =await http.post(`service-user/group/`,modifiedGroup)

            //Salvamento GroupStaff
            //criar os novos groupstaffs marcados no formulario
            if(groupStaffs.length){
                for(const groupStaff of groupStaffs){
                    await http.post(`service-user/group-staff/`, {
                        idGroup: result.data.idGroup,
                        idStaff: groupStaff.idStaff,
                    })
                }
            }  
            
            //criar os novos groupstaffs marcados no formulario
            if(groupRules.length){
                for(const groupRule of groupRules){
                    await http.post(`service-user/group-rule/`, {
                        idGroup: result.data.idGroup,
                        idRule: groupRule.idRule,
                    })
                }
            }

            setSnackMessage("Registro criado com sucesso.")
          }


          //Salvamento Group
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



    React.useEffect(()=>{
        reset({
            name: group.name,
            isAdmin: group.isAdmin
        })

        setIsAdmin(group.isAdmin)
        const loadStaff = async () =>{
            setLoading(true)
            try{
                setStaffs([])
                if(group.idGroup){
                    const responseGroupStaff = await http.post('service-user/group-staff/list', {
                        idGroup: group.idGroup,
                        items: 999999999999,
                        page: 1,
                        order: {idGroup:"ASC"}
                    })

                    console.log(responseGroupStaff.data.data?.result)
                    if(responseGroupStaff.data.data?.result){
                        if(Array.isArray(responseGroupStaff.data.data.result)){
                            setGroupStaffs(responseGroupStaff.data.data.result)
                            setOriginalGroupStaffs(responseGroupStaff.data.data.result)
                        }
                        else{
                            setGroupStaffs([])
                            setOriginalGroupStaffs([])
                        }
                    }
                    else{
                        setGroupStaffs([])
                        setOriginalGroupStaffs([])
                    }
                }
                else{
                    setGroupStaffs([])
                    setOriginalGroupStaffs([])
                }

                const responseStaff = await http.post('service-user/staff/list', {
                    active: true,
                    items: 999999999999,
                    page: 1,
                    order: {name:"ASC"}
                })



                if(responseStaff.data.data?.result){
                    if(Array.isArray(responseStaff.data.data.result)){
                        setStaffs(responseStaff.data.data.result)
                    }
                }

            }
            catch(error){

            }
            setLoading(false)
        }
        loadStaff()

        const loadRule = async () =>{
            setLoading(true)
            try{
                setRules([])
                if(group.idGroup){
                    const responseGroupRule = await http.post('service-user/group-rule/list', {
                        idGroup: group.idGroup,
                        items: 999999999999,
                        page: 1,
                        order: {idGroup:"ASC"}
                    })

                    console.log(responseGroupRule.data.data?.result)
                    if(responseGroupRule.data.data?.result){
                        if(Array.isArray(responseGroupRule.data.data.result)){
                            setGroupRules(responseGroupRule.data.data.result)
                            setOriginalGroupRules(responseGroupRule.data.data.result)
                        }
                        else{
                            setGroupRules([])
                            setOriginalGroupRules([])
                        }
                    }
                    else{
                        setGroupRules([])
                        setOriginalGroupRules([])
                    }
                }
                else{
                    setGroupRules([])
                    setOriginalGroupRules([])
                }

                const responseRule = await http.post('service-user/rule/list', {
                    items: 999999999999,
                    page: 1,
                    order: {description:"ASC"}
                })



                if(responseRule.data.data?.result){
                    if(Array.isArray(responseRule.data.data.result)){
                        setRules(responseRule.data.data.result)
                    }
                }

            }
            catch(error){

            }
            setLoading(false)
        }
        loadRule()


    },[group])


    const handleGroupStaff= (event: any) =>{
        let newGroupStaffs = [... groupStaffs]
        if(event.target.checked){
            
            newGroupStaffs.push({
                idGroupstaff:0,
                idGroup:0,
                idStaff: +event.target.value,
            })
            console.log(event.target.value)
        }
        else{
            newGroupStaffs = [... newGroupStaffs.filter(e => e.idStaff != +event.target.value)]
        }
        console.log(newGroupStaffs)
        setGroupStaffs(newGroupStaffs) 
    }

    const handleGroupRule= (event: any) =>{
        let newGroupRules = [... groupRules]
        if(event.target.checked){
            
            newGroupRules.push({
                idGroupRule:0,
                idGroup:0,
                idRule: +event.target.value,
            })
            console.log(event.target.value)
        }
        else{
            newGroupRules = [... newGroupRules.filter(e => e.idRule != +event.target.value)]
        }
        console.log(newGroupRules)
        setGroupRules(newGroupRules) 
    }

    
    const handleEnableRules =(enabled: boolean)=>{
        setIsAdmin(enabled)
        if(!enabled){
            setGroupRules([])
        }
    }
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

                    </Grid>
                    <Grid item xs={12} sm={6}>

                        <FormControl fullWidth sx={{ mb: 4 }}>
                            <Controller
                                name='isAdmin'
                                control={control}
                                rules={{ required: true }}
                                render={({ field: { value, onChange} }) => (
                                        <FormControlLabel
                                            control={
                                                <Switch 
                                                    checked={value} 
                                                    onChange={event=>{
                                                        handleEnableRules(event.target.checked);
                                                        onChange(event);
                                                      }}
                                                />
                                            }
                                            label="Cargo Administrativo"
                                        />
                                )}
                            />
                            {errors.isAdmin && <FormHelperText sx={{ color: 'error.main' }}>{errors.isAdmin.message}</FormHelperText>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        { loading &&
                            <Box sx={{ width: '100%' }}>
                                <CircularProgress color="secondary" />
                            </Box> 
                        }
                        {
                            staffs.map((staff, index) =>{
                                return(
                                    <Fragment>
                                        <Checkbox key={index} value={staff.idStaff} onChange={handleGroupStaff} checked={groupStaffs.find(e => e.idStaff == staff.idStaff)? true : false} />
                                        {staff.name}
                                        <br/>
                                    </Fragment>
                                   
                                )
                            })
                        }
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        { loading &&
                            <Box sx={{ width: '100%' }}>
                                <CircularProgress color="secondary" />
                            </Box> 
                        }
                        {
                            !isAdmin && rules.map((rule, index) =>{
                                return(
                                    <Fragment>
                                        <Checkbox key={index} value={rule.idRule} onChange={handleGroupRule} checked={groupRules.find(e => e.idRule == rule.idRule)? true : false} />
                                        {rule.description}
                                        <br/>
                                    </Fragment>
                                   
                                )
                            })
                        }
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
    )
}