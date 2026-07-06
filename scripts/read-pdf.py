import sys

# Let's see if we can import pypdf or PyPDF2 or pdfminer or any pdf library
try:
    import pypdf
    print("pypdf is installed!")
except ImportError:
    try:
        import PyPDF2 as pypdf
        print("PyPDF2 is installed!")
    except ImportError:
        print("No standard PDF library found in default environment.")
