import React, { useState } from 'react'
import { Grid,Paper, Avatar, TextField, Button, Typography,Link, FormControlLabel, Checkbox } from '@mui/material/'
import { CenterFocusStrong, FormatAlignJustify, LockOutlined } from '@mui/icons-material/';
import { useAuth } from '@/hooks/useAuth';


const Login=()=>{

    const auth = useAuth()

    const [usuario, setUsuario] = useState<string>("")
    const [password, setPassword] = useState<string>("")
    
    const handleLogin = ()=> {
        console.log({
            login: usuario,
            password: password
        })

        auth.login({
            login: usuario,
            password: password
        }, errorAlert)
    }

    const errorAlert = ()=>{
        setUsuario('')
        setPassword('')
        alert('usuario ou senha inválida')
    }
    const onChangeUsuario = (e:any) =>{
        console.log(e.target.value)
        setUsuario(e.target.value)
    }

    const onChangePassword = (e:any) =>{
        setPassword(e.target.value)
    }

    const paperStyle={padding :20,height:'70vh',width:280, margin:"20px auto"}
    const avatarStyle={backgroundColor:'#1bbd7e'}
    const btnstyle={margin:'8px 0'}
    return(
        <Grid>
            <Paper elevation={10} style={paperStyle}>
                <Grid display="flex" justifyContent="center" alignItems="center">
                     <Avatar style={avatarStyle}> <LockOutlined/> </Avatar>
                    <h2>Sign In</h2>
                </Grid>
                
                <TextField 
                    label='Username' 
                    placeholder='Enter username' 
                    fullWidth 
                    required
                    value={usuario}
                    onChange={ onChangeUsuario }
                />
                <p></p>
                <TextField 
                    label='Password' 
                    placeholder='Enter password' 
                    type='password' 
                    fullWidth 
                    required
                    value={password}
                    onChange={ onChangePassword }
                />
                <FormControlLabel
                    control={
                    <Checkbox
                        name="checkedB"
                        color="primary"
                    />
                    }
                    label="Remember me"
                 />
                <Button type='submit' onClick={()=>handleLogin()} color='primary' variant="contained" style={btnstyle} fullWidth>Sign in</Button>
                <Typography >
                     <Link href="#" >
                        Forgot password ?
                </Link>
                </Typography>
                <Typography > Do you have an account ?
                     <Link href="#" >
                        Sign Up 
                </Link>
                </Typography>
            </Paper>
        </Grid>
    )
}

export default Login