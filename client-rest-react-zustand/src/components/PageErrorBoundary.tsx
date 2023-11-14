import { Component } from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
    children?: React.ReactNode;
}

interface State {
    hasError: boolean;
}

export default class PageErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch() {
        this.setState({ hasError: true });
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'start',
                    minHeight: '100vh',
                    padding: '50px 20px'
                }}
            >
                <Box
                    sx={{
                        maxWidth: '600px',
                        backgroundColor: '#ccc',
                        borderRadius: '10px',
                        padding: '25px',
                        height: 'auto'
                    }}
                >
                    <Typography variant="h5" mb="20px">
                        Something went wrong with the page...
                    </Typography>
                    <Typography>
                        We are sorry that you are facing this error. Please
                        refresh the page in a minute or contact administrator,
                        hopefully the page will be up and running soon...
                    </Typography>
                </Box>
            </Box>
        );
    }
}
