import axios from "axios";
import * as React from 'react';
import './App.css';
import * as session from './session';
import logo from './logo.svg';

export interface StoryState {
    email: string;
    password: string;
    contentMessage: string;
    contentHeadLine: string | null;
    isRequesting: boolean;
    isLoggedIn: boolean;
    data: Stories.Item[];
    error: string;
}

class Stories extends React.Component<{}, StoryState> {
    public state = {
        contentMessage: "",
        contentHeadLine: "",
        email: "",
        password: "",
        isRequesting: false,
        isLoggedIn: false,
        data: [],
        error: ""
    };

    public componentDidMount() {
        this.setState({ isLoggedIn: session.isSessionValid() });
        this.getTestData();
    }

    public render() {
        return (
            <div className="App">
                <header className="App-header">
                    <img src={logo} className="App-logo" alt="logo" />
                    <h1 className="App-title">NFL Stories - built on MERN!</h1>
                </header>
                <div className="App-error">{this.state.error}</div>
                {this.state.isLoggedIn ? (
                    <div>
                        <div>
                            <div style={{ textAlign: "left" }}>
                                {this.state.data.map((item: Stories.Item, index) =>
                                    <div className="card" key={index}>
                                        <div className="row no-gutters">
                                            <div className="col-auto">
                                                <img src={item.picture} className="img-fluid" alt="" height="100" />
                                            </div>
                                            <div className="col">
                                                <div className="card-block px-2">
                                                    <h4 className="card-title"><a href={item.url} target="_blank">{item.headLine}</a></h4>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer w-100 text-muted">
                                            <ul>
                                                {item.comments}
                                            </ul>
                                            <form onSubmit={this.handleSubmit}>
                                                <div className="form-group">
                                                    <label>Comment: </label>
                                                    <input type="text" className="form-control" data-headline={item.headLine} 
                                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ contentMessage: e.target.value, contentHeadLine: e.target.getAttribute("data-headline") })}
                                                    />
                                                    <button type="submit" className="btn btn-primary">Submit</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>)}
                            </div>
                        </div>
                        <button disabled={this.state.isRequesting} onClick={this.getTestData}>Scrape It!</button>
                        <button disabled={this.state.isRequesting} onClick={this.logout}>Log out</button>
                    </div>
                ) : (
                        <div className="App-login">
                            (try the credentials: testuser@email.com / my-password)
            <input
                                disabled={this.state.isRequesting}
                                placeholder="email"
                                type="text"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ email: e.target.value })}
                            />
                            <input
                                disabled={this.state.isRequesting}
                                placeholder="password"
                                type="password"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => this.setState({ password: e.target.value })}
                            />
                            <button disabled={this.state.isRequesting} onClick={this.handleLogin}>Log in</button>
                        </div>
                    )}
            </div>
        );
    }

    private handleSubmit = async(): Promise<void> => {
        const { contentHeadLine, contentMessage } = this.state;
        console.log(contentHeadLine, contentMessage);
        await axios.put("/api/nfl/update/", {contentHeadLine, contentMessage}, { headers: session.getAuthHeaders() });
    }

    private handleLogin = async (): Promise<void> => {
        const { email, password } = this.state;
        try {
            this.setState({ error: "" });
            this.setState({ isRequesting: true });
            const response = await axios.post<{ token: string; expiry: string }>("/api/users/login", { email, password });
            const { token, expiry } = response.data;
            session.setSession(token, expiry);
            this.setState({ isLoggedIn: true });
        } catch (error) {
            this.setState({ error: "Something went wrong" });
        } finally {
            this.setState({ isRequesting: false });
        }
    };

    private logout = (): void => {
        session.clearSession();
        this.setState({ isLoggedIn: false });
    };

    private getTestData = async (): Promise<void> => {
        try {
            this.setState({ error: "" });
            // await axios.get<Stories.Item[]>("/api/nfl/scrape", { headers: session.getAuthHeaders() });
            const response = await axios.get<Stories.Item[]>("/api/nfl", { headers: session.getAuthHeaders() });
            console.log(response);
            this.setState({ data: response.data });
        } catch (error) {
            this.setState({ error: "Something went wrong" });
        } finally {
            this.setState({ isRequesting: false });
        }
    }
}

export default Stories;
