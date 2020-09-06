import React, { Component } from 'react';

class UrlShortnerForm extends Component {
    state = {
        url: '',
        slug: '',
        error: '',
        link: ''
    }

    handleChangeUrl = (e) => {
        this.setState({ url: e.target.value })
    }

    handleChangeSlug = (e) => {
        this.setState({ slug: e.target.value })
    }

    makeUrl = async (e) => {
        e.preventDefault();
        const self = this;
        const response = await fetch('/url', {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                url: this.state.url,
                slug: this.state.slug || undefined,
            }),
        });
        if (response.ok) {
            const result = await response.json();
            console.log(result);
            self.setState({ link: `${result.slug}`, error: '' })

        }
        else if (response.status === 429) {
            self.setState({ error: 'You are sending too many requests. Try again in 30 seconds.', link: '' })
        }
        else {
            const result = await response.json();
            console.log(result);
            self.setState({ error: result.message, link: '' })

        }
    }

    render() {
        return (
            <div>
                <form className="form">
                    <br></br>
                    {this.state.error &&
                        <div className="error">
                            {this.state.error}
                        </div>
                    }
                    <input className="input" type="text" name="url" id="url" onChange={this.handleChangeUrl} placeholder="enter a url" value={this.state.url} />
                    <input className="input" type="text" name="slug" id="slug" onChange={this.handleChangeSlug} placeholder="enter a slug" value={this.state.slug}>
                    </input>
                    <button type="submit" className="create" onClick={this.makeUrl}>create</button>
                </form>
                {this.state.link &&
                    <div>
                        <p className="created">Your short url is:{' '}{' '}
                            <a href={this.state.link}>
                                {this.state.link}
                            </a>
                        </p>
                    </div>
                }
            </div >
        );
    }
}

export default UrlShortnerForm;